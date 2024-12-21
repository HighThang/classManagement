package ptit.d20.do_an.class_management.service;

import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ptit.d20.do_an.class_management.exception.BusinessException;
import ptit.d20.do_an.class_management.exception.ResourceNotFoundException;
import ptit.d20.do_an.class_management.domain.ClassDocument;
import ptit.d20.do_an.class_management.domain.Classroom;
import ptit.d20.do_an.class_management.domain.User;
import ptit.d20.do_an.class_management.dto.ApiResponse;
import ptit.d20.do_an.class_management.enumeration.RoleName;
import ptit.d20.do_an.class_management.repository.ClassroomRepository;
import ptit.d20.do_an.class_management.repository.DocumentRepository;

import javax.persistence.criteria.Predicate;
import javax.transaction.Transactional;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Log4j2
@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final ClassroomRepository classroomRepository;
    private final UserService userService;
    private final String tempFolder;
    private final String documentFolder;

    @Autowired
    public DocumentService(DocumentRepository documentRepository,
                           ClassroomRepository classroomRepository,
                           UserService userService,
                           @Value("${app.temp}") String tempFolder,
                           @Value("${app.document}") String documentFolder) {
        this.documentRepository = documentRepository;
        this.classroomRepository = classroomRepository;
        this.userService = userService;
        this.tempFolder = tempFolder;
        this.documentFolder = documentFolder;
    }

    public List<ClassDocument> getAllDocumentInClass(Long classId) {
        return documentRepository.findAllByClassroomIdOrderByLastModifiedDateDesc(classId);
    }

    public ApiResponse uploadDocumentPdf(MultipartFile file, Long classId) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Not found classroom!"));

        File tempFolder = new File(this.tempFolder + "/document");
        if (!tempFolder.exists()) {
            tempFolder.mkdirs();
        }

        // Create a file object with the specified folder
        File tempFile = new File(tempFolder, file.getOriginalFilename());
        try {
            file.transferTo(tempFile);
        } catch (Exception e) {
            log.error("Cannot process file", e);
            throw new BusinessException("Cannot process file");
        }

        // Check file extension
        String fileExtension = ClassroomService.getExtension(tempFile);
        if (!StringUtils.equalsIgnoreCase(fileExtension, "pdf")) {
            throw new BusinessException("Only process PDF files");
        }

        // assume upload to storage
        String finalPath = documentFolder + "/" + classId + "/";
        File finalFolder = new File(finalPath);
        if (!finalFolder.exists()) {
            finalFolder.mkdirs();
        }
        String documentLink = finalPath + file.getOriginalFilename();
        File finalPdfFile = new File(documentLink);
        try {
            Files.move(tempFile.toPath(), finalPdfFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            log.error("Cannot move file to /document folder", e);
            throw new BusinessException("Cannot move file to /document folder");
        }

        ClassDocument document = new ClassDocument();
        document.setDocumentLink(documentLink);
        document.setDocumentName(file.getOriginalFilename());
        document.setClassroom(classroom);
        documentRepository.save(document);

        return new ApiResponse(true, "Success");
    }

    public String getFilePath(Long documentId) {
        ClassDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Not found document!"));

        return document.getDocumentLink();
    }

    @Transactional
    public ApiResponse deleteDocument(Long documentId) {
        User user = userService.getCurrentUserLogin();
        if (user.getRole().getName() != RoleName.TEACHER) {
            throw new BusinessException("Missing permission");
        }
        List<Classroom> classrooms = user.getClassrooms();
        List<ClassDocument> documents = classrooms.stream().flatMap(classroom -> classroom.getDocuments().stream()).collect(Collectors.toList());
        documents.stream()
                .filter(document1 -> document1.getId().equals(documentId)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Not found document"));
        try {
            documentRepository.deleteById(documentId);
        } catch (Exception e) {
            log.error("Exception during delete operation", e);
            throw new BusinessException("Deletion failed due to an error");
        }

        return new ApiResponse(true, "Success");
    }
}
