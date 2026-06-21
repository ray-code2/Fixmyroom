package com.fixmyroom.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailer;
    private final String from;
    private final String appBaseUrl;

    public EmailService(
            @Autowired(required = false) JavaMailSender mailer,
            @Value("${app.mail.from:noreply@fixmyroom.app}") String from,
            @Value("${app.base-url:http://localhost:8081}") String appBaseUrl
    ) {
        this.mailer = mailer;
        this.from = from;
        this.appBaseUrl = appBaseUrl;
    }

    public void sendNewIssueNotification(List<String> managerEmails, String issueTitle, String unitNumber) {
        if (managerEmails.isEmpty()) return;
        String unit = unitNumber != null ? " (Unit " + unitNumber + ")" : "";
        asyncSend(managerEmails,
                "New maintenance issue: " + issueTitle,
                "A new maintenance issue has been reported" + unit + ":\n\n\""
                        + issueTitle + "\"\n\nLog in to FMR to assign it to a technician.");
    }

    public void sendAssignedNotification(String techEmail, String issueTitle) {
        asyncSend(List.of(techEmail),
                "You've been assigned: " + issueTitle,
                "You have been assigned to a maintenance issue:\n\n\""
                        + issueTitle + "\"\n\nLog in to FMR to view details and update the status.");
    }

    public void sendCostSubmittedNotification(List<String> managerEmails, String issueTitle) {
        if (managerEmails.isEmpty()) return;
        asyncSend(managerEmails,
                "Cost submitted for approval: " + issueTitle,
                "A cost report has been submitted for your approval:\n\n\""
                        + issueTitle + "\"\n\nLog in to FMR to review and approve or reject it.");
    }

    public void sendCostApprovedNotification(String techEmail, String issueTitle) {
        asyncSend(List.of(techEmail),
                "Cost approved: " + issueTitle,
                "Your cost report has been approved:\n\n\"" + issueTitle + "\"\n\nNo further action needed.");
    }

    public void sendCostRejectedNotification(String techEmail, String issueTitle, String reason) {
        asyncSend(List.of(techEmail),
                "Cost rejected: " + issueTitle,
                "Your cost report was rejected:\n\n\"" + issueTitle
                        + "\"\n\nReason: " + reason
                        + "\n\nPlease update your cost report in FMR.");
    }

    public void sendPasswordResetEmail(String managerEmail, String token) {
        String link = appBaseUrl + "?reset=" + token;
        asyncSend(List.of(managerEmail),
                "Reset your FMR password",
                "You requested a password reset for your Fix My Room account.\n\n"
                        + "Click the link below to reset your password (valid for 30 minutes):\n\n"
                        + link
                        + "\n\nIf you did not request this, you can safely ignore this email.");
    }

    private void asyncSend(List<String> to, String subject, String body) {
        if (mailer == null) {
            log.debug("Mail not configured — skipping email to {}: {}", to, subject);
            return;
        }
        CompletableFuture.runAsync(() -> {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(from);
                msg.setTo(to.toArray(new String[0]));
                msg.setSubject("[FMR] " + subject);
                msg.setText(body);
                mailer.send(msg);
                log.debug("Email sent to {}: {}", to, subject);
            } catch (Exception e) {
                log.warn("Email send failed to {}: {}", to, e.getMessage());
            }
        });
    }
}
