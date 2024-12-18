from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os
import face_recognition
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BASE_FOLDER_INPUT = "../classManagement_BE/"
BASE_FOLDER_STUDENT = "../classManagement_BE/"

def connect_db():
    return mysql.connector.connect(host="localhost", user="root", password="2952002", database="class_management")

def extract_faces_with_face_recognition(image_path):
    image = face_recognition.load_image_file(image_path)
    face_locations = face_recognition.face_locations(image)
    face_encodings = face_recognition.face_encodings(image, face_locations)

    faces = []
    for idx, encoding in enumerate(face_encodings):
        faces.append({
            "index": idx,
            "encoding": encoding
        })
    return faces


@app.route("/recognize_faces", methods=["POST"])
def recognize_faces():
    data = request.json
    schedule_id = data.get("scheduleId")

    conn = connect_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT image_class_attendance FROM class_schedule WHERE id = %s", (schedule_id,))
    schedule = cursor.fetchone()

    if not schedule or not schedule["image_class_attendance"]:
        return jsonify({"error": "Không tìm thấy đường dẫn ảnh điểm danh hoặc dữ liệu không hợp lệ"}), 404

    input_image_path = os.path.join(BASE_FOLDER_INPUT, schedule["image_class_attendance"])

    if not os.path.exists(input_image_path):
        return jsonify({"error": f"Ảnh điểm danh không tồn tại: {input_image_path}"}), 404

    # Lấy danh sách học sinh từ bảng class_attendance và class_registration
    cursor.execute(""" 
        SELECT ca.id AS attendance_id, ca.class_registration_id, cr.imgurlrequest, cr.last_name, cr.surname, cr.first_name
        FROM class_attendance ca 
        JOIN class_registration cr ON ca.class_registration_id = cr.id WHERE ca.schedule_id = %s
    """, (schedule_id,))
    students = cursor.fetchall()

    if not students:
        return jsonify({"error": "Không có học sinh cần điểm danh trong lịch học này"}), 404

    # Tạo danh sách thông tin và đường dẫn ảnh học sinh
    student_images = [
        {
            "class_registration_id": student["class_registration_id"],
            "image_path": os.path.join(BASE_FOLDER_STUDENT, student["imgurlrequest"]),
            "student_name": student["last_name"] + ' ' + student["surname"] + ' ' + student["first_name"]
        }
        for student in students if student["imgurlrequest"] and os.path.exists(os.path.join(BASE_FOLDER_STUDENT, student["imgurlrequest"]))
    ]

    if not student_images:
        return jsonify({"error": "Không tìm thấy hình ảnh hợp lệ của học sinh"}), 404
    
    # Tạo danh sách encoding khuôn mặt học sinh
    student_encodings = []
    student_metadata = []
    students_without_encoding = []

    for student in students:
        student_image_path = os.path.join(BASE_FOLDER_STUDENT, student["imgurlrequest"])
        if not student["imgurlrequest"] or not os.path.exists(student_image_path):
            continue

        try:
            student_image = face_recognition.load_image_file(student_image_path)
            encodings = face_recognition.face_encodings(student_image)
            if encodings:
                student_encodings.append(encodings[0])
                student_metadata.append({
                    "student_id": student["class_registration_id"],
                    "student_name": f"{student['last_name']} {student['surname']} {student['first_name']}"
                })
            else: 
                students_without_encoding.append({
                    "student_id": student["class_registration_id"],
                    "student_name": f"{student['last_name']} {student['surname']} {student['first_name']}"
                })

        except Exception as e:
            logger.error(f"Lỗi khi xử lý ảnh học sinh {student_image_path}: {e}")
            students_without_encoding.append({
                "student_id": student["class_registration_id"],
                "student_name": f"{student['last_name']} {student['surname']} {student['first_name']}"
            })
            
    if not student_encodings:
        return jsonify({"error": "Không tìm thấy khuôn mặt học sinh nào hợp lệ"}), 404

    # Nhận diện khuôn mặt từ ảnh điểm danh
    faces = extract_faces_with_face_recognition(input_image_path)
    if not faces:
        return jsonify({"error": "Không phát hiện khuôn mặt nào trong ảnh điểm danh"}), 400

    # So sánh khuôn mặt tách ra với danh sách học sinh và cập nhật điểm danh
    matched_students = []
    unmatched_faces = list(range(len(faces)))
    students_not_in_photo = student_metadata + students_without_encoding

    for face in faces:
        matches = face_recognition.compare_faces(student_encodings, face["encoding"], tolerance=0.6)
        face_distances = face_recognition.face_distance(student_encodings, face["encoding"])

        if any(matches):
            best_match_index = face_distances.argmin()
            matched_student = student_metadata[best_match_index]

            # Thêm học sinh vào danh sách đã khớp
            matched_students.append({
                "student_id": matched_student["student_id"],
                "student_name": matched_student["student_name"],
                "face_index": face["index"]
            })

            # Cập nhật trạng thái điểm danh
            cursor.execute("""
                UPDATE class_attendance 
                SET is_attended = TRUE 
                WHERE class_registration_id = %s AND schedule_id = %s
            """, (matched_student["student_id"], schedule_id))
            conn.commit()

            # Loại bỏ khuôn mặt và học sinh khỏi danh sách
            unmatched_faces.remove(face["index"])
            students_not_in_photo.remove(matched_student)

    # Tạo một mảng chứa tất cả student_id từ students_not_in_photo
    student_ids_not_in_photo = [student["student_id"] for student in students_not_in_photo]

    # Duyệt qua tất cả student_id và cập nhật trạng thái điểm danh
    for student_id in student_ids_not_in_photo:
        cursor.execute("""
            UPDATE class_attendance
            SET is_attended = FALSE
            WHERE class_registration_id = %s AND schedule_id = %s
        """, (student_id, schedule_id))
        conn.commit()

    cursor.close()
    conn.close()

    response = {
        "matched_students": matched_students,
        "students_not_in_photo": students_not_in_photo,
        "students_without_encoding": students_without_encoding,
        "unmatched_faces_counts": len(unmatched_faces),
    }

    return jsonify(response), 200

if __name__ == "__main__":
    app.run(debug=True)