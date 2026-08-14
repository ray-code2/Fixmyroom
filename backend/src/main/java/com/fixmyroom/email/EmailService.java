package com.fixmyroom.email;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
                        + issueTitle + "\"\n\nLog in to Satin to assign it to a technician.");
    }

    public void sendAssignedNotification(String techEmail, String issueTitle) {
        asyncSend(List.of(techEmail),
                "You've been assigned: " + issueTitle,
                "You have been assigned to a maintenance issue:\n\n\""
                        + issueTitle + "\"\n\nLog in to Satin to view details and update the status.");
    }

    public void sendCostSubmittedNotification(List<String> managerEmails, String issueTitle) {
        if (managerEmails.isEmpty()) return;
        asyncSend(managerEmails,
                "Cost submitted for approval: " + issueTitle,
                "A cost report has been submitted for your approval:\n\n\""
                        + issueTitle + "\"\n\nLog in to Satin to review and approve or reject it.");
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
                        + "\n\nPlease update your cost report in Satin.");
    }

    public void sendPasswordResetEmail(String managerEmail, String token) {
        String link = appBaseUrl + "?reset=" + token;

        String plain = "You requested a password reset for your Satin account.\n\n"
                + "Click the link below to reset your password (valid for 30 minutes):\n\n"
                + link
                + "\n\nIf you did not request this, you can safely ignore this email.";

        asyncSendHtml(managerEmail, "Reset your Satin password",
                buildPasswordResetHtml(link), plain);
    }

    /** Satin-branded HTML for the password reset email. Inline styles only — email clients ignore <style> blocks and external CSS. */
    private String buildPasswordResetHtml(String link) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Reset your Satin password</title>
                </head>
                <body style="margin:0; padding:0; background-color:#F5F0EB; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:#F5F0EB; padding:32px 16px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#FFFFFF; border:1px solid #EADFD2; border-radius:24px; overflow:hidden;">
                          <!-- Brand header -->
                          <tr>
                            <td style="padding:32px 32px 0 32px;">
                              <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="width:44px; height:44px; background-color:#4B2E1F; border-radius:12px; text-align:center; vertical-align:middle;">
                                    <span style="color:#FFFFFF; font-size:13px; font-weight:800; letter-spacing:0.5px;">Satin</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding:24px 32px 8px 32px;">
                              <h1 style="margin:0 0 12px 0; color:#171412; font-size:22px; font-weight:700;">Reset your password</h1>
                              <p style="margin:0 0 8px 0; color:#6F625A; font-size:14px; line-height:22px;">
                                We received a request to reset the password for your Satin manager account.
                                Click the button below to choose a new password.
                              </p>
                            </td>
                          </tr>
                          <!-- CTA button -->
                          <tr>
                            <td style="padding:16px 32px 8px 32px;">
                              <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="background-color:#4B2E1F; border-radius:12px;">
                                    <a href="%s" target="_blank"
                                       style="display:inline-block; padding:14px 28px; color:#FFFFFF; font-size:15px; font-weight:700; text-decoration:none;">
                                      Reset password
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <!-- Expiry note -->
                          <tr>
                            <td style="padding:8px 32px 24px 32px;">
                              <p style="margin:0 0 16px 0; color:#6F625A; font-size:13px; line-height:20px;">
                                This link is valid for <strong style="color:#171412;">30 minutes</strong>. If the button doesn't work,
                                copy and paste this URL into your browser:
                              </p>
                              <p style="margin:0; word-break:break-all;">
                                <a href="%s" target="_blank" style="color:#8A5A2F; font-size:13px; text-decoration:underline;">%s</a>
                              </p>
                            </td>
                          </tr>
                          <!-- Divider + footer -->
                          <tr>
                            <td style="padding:0 32px;">
                              <div style="border-top:1px solid #EADFD2;"></div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:20px 32px 28px 32px;">
                              <p style="margin:0; color:#6F625A; font-size:12px; line-height:18px;">
                                If you didn't request a password reset, you can safely ignore this email — your password won't change.
                              </p>
                              <p style="margin:12px 0 0 0; color:#6F625A; font-size:12px;">— The Satin team</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(link, link, link);
    }

    private void asyncSendHtml(String to, String subject, String html, String plainFallback) {
        if (mailer == null) {
            log.debug("Mail not configured — skipping HTML email to {}: {}", to, subject);
            return;
        }
        CompletableFuture.runAsync(() -> {
            try {
                MimeMessage mime = mailer.createMimeMessage();
                // true => multipart, so we can attach both a plain-text and HTML body.
                MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
                helper.setFrom(from);
                helper.setTo(to);
                helper.setSubject("[Satin] " + subject);
                helper.setText(plainFallback, html);
                mailer.send(mime);
                log.debug("HTML email sent to {}: {}", to, subject);
            } catch (Exception e) {
                log.warn("HTML email send failed to {}: {}", to, e.getMessage());
            }
        });
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
                msg.setSubject("[Satin] " + subject);
                msg.setText(body);
                mailer.send(msg);
                log.debug("Email sent to {}: {}", to, subject);
            } catch (Exception e) {
                log.warn("Email send failed to {}: {}", to, e.getMessage());
            }
        });
    }
}
