package ptit.d20.do_an.class_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ptit.d20.do_an.class_management.domain.ClassDocument;
import ptit.d20.do_an.class_management.service.DocumentService;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/document")
public class ClassDocumentController {
    private final DocumentService documentService;

    @Autowired
    public ClassDocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<?> getAllDocumentInClass(@RequestParam Long classId) throws Exception {
        List<ClassDocument> list = documentService.getAllDocumentInClass(classId);
        return ResponseEntity.ok(new PageImpl<>(list));
    }

    @PutMapping("/{classId}")
    public ResponseEntity<?> uploadDocumentPdf(@RequestParam("file") MultipartFile file, @PathVariable Long classId) {
        return ResponseEntity.ok(documentService.uploadDocumentPdf(file, classId));
    }

    @PutMapping("/delete/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.deleteDocument(documentId));
    }

    @GetMapping("/download/{documentId}")
    public void getDocumentPdf(HttpServletResponse response, @PathVariable Long documentId) throws IOException {
        String filePath = documentService.getFilePath(documentId);
        File file = new File(filePath);

        if (!file.exists()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        // Set the response headers
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
        response.setContentLength((int) file.length());

        // Stream the file content to the response
        try (FileInputStream fileIn = new FileInputStream(file);
             ServletOutputStream out = response.getOutputStream()) {

            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = fileIn.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
            out.flush();
        }
    }
}
