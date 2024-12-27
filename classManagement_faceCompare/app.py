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

    cursor.execute(""" 
        SELECT ca.id AS attendance_id, ca.class_registration_id, cr.imgurlrequest, cr.last_name, cr.surname, cr.first_name
        FROM class_attendance ca 
        JOIN class_registration cr ON ca.class_registration_id = cr.id WHERE ca.schedule_id = %s
    """, (schedule_id,))
    students = cursor.fetchall()

    if not students:
        return jsonify({"error": "Không có học sinh cần điểm danh trong lịch học này"}), 404
    
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
    unmatched_faces = faces.copy()
    students_not_in_photo = student_metadata.copy()

    for face in faces:
        best_match_index = None
        best_match_distance = 0.6

        for idx, student_encoding in enumerate(student_encodings):
            distance = face_recognition.face_distance([student_encoding], face["encoding"])[0]
            if distance < best_match_distance:
                best_match_distance = distance
                best_match_index = idx

        if best_match_index is not None:
            matched_student = students_not_in_photo.pop(best_match_index)
            matched_students.append(matched_student)

            # # Cập nhật trạng thái điểm danh
            # cursor.execute("""
            #     UPDATE class_attendance 
            #     SET is_attended = TRUE 
            #     WHERE class_registration_id = %s AND schedule_id = %s
            # """, (matched_student["student_id"], schedule_id))
            # conn.commit()

            unmatched_faces.remove(face)
            student_encodings.pop(best_match_index)

    # Cập nhật trạng thái điểm danh
    for student in matched_students:
        cursor.execute("""
            UPDATE class_attendance 
            SET is_attended = TRUE 
            WHERE class_registration_id = %s AND schedule_id = %s
        """, (student["student_id"], schedule_id))
        conn.commit()

    # Cập nhật trạng thái điểm danh cho các học sinh không có trong ảnh
    for student in students_not_in_photo:
        cursor.execute("""
            UPDATE class_attendance
            SET is_attended = FALSE
            WHERE class_registration_id = %s AND schedule_id = %s
        """, (student["student_id"], schedule_id))
        conn.commit()

    # Cập nhật trạng thái điểm danh cho các học sinh có ảnh không hợp lệ
    for student in students_without_encoding:
        cursor.execute("""
            UPDATE class_attendance
            SET is_attended = FALSE
            WHERE class_registration_id = %s AND schedule_id = %s
        """, (student["student_id"], schedule_id))
        conn.commit()

    response = {
        "matched_students": matched_students,
        "students_not_in_photo": students_not_in_photo,
        "students_without_encoding": students_without_encoding,
        "unmatched_faces_counts": len(unmatched_faces),
    }

    return jsonify(response), 200

if __name__ == "__main__":
    app.run(debug=True)