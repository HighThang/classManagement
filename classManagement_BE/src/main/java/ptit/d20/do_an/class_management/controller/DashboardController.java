package ptit.d20.do_an.class_management.controller;

import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ptit.d20.do_an.class_management.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/all-class-schedule")
    public ResponseEntity<?> getAllClass() {
        return ResponseEntity.ok(new PageImpl<>(dashboardService.fetchClass()));
    }
}
