package com.fixmyroom.leads;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class LeadService {
    private static final Logger log = LoggerFactory.getLogger(LeadService.class);
    private final LeadRepository leadRepository;

    private static final String[] HEADERS = {
            "Name", "Role", "Property", "Property Type",
            "Email", "Phone", "Rooms", "Notes", "Submitted At"
    };
    private static final int[] COL_WIDTHS = {
            6500, 4500, 9000, 5500,
            10500, 4500, 3000, 14000, 9000
    };

    public LeadService(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }

    public byte[] exportAsXlsx() {
        List<LeadExportRow> rows = leadRepository.findAllForExport();

        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = wb.createSheet("Demo Requests");
            sheet.createFreezePane(0, 1);

            XSSFCellStyle headerStyle = buildHeaderStyle(wb);
            XSSFCellStyle dataStyle = buildDataStyle(wb);
            XSSFCellStyle altStyle = buildAltStyle(wb);

            XSSFRow headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(20);
            for (int i = 0; i < HEADERS.length; i++) {
                XSSFCell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, COL_WIDTHS[i]);
            }

            for (int r = 0; r < rows.size(); r++) {
                LeadExportRow row = rows.get(r);
                XSSFRow dataRow = sheet.createRow(r + 1);
                dataRow.setHeightInPoints(18);
                XSSFCellStyle style = (r % 2 == 0) ? dataStyle : altStyle;

                setCell(dataRow, 0, row.fullName(), style);
                setCell(dataRow, 1, row.role(), style);
                setCell(dataRow, 2, row.propertyName(), style);
                setCell(dataRow, 3, row.propertyType(), style);
                setCell(dataRow, 4, row.email(), style);
                setCell(dataRow, 5, row.phone(), style);
                XSSFCell roomsCell = dataRow.createCell(6);
                roomsCell.setCellValue(row.roomCount());
                roomsCell.setCellStyle(style);
                setCell(dataRow, 7, row.notes(), style);
                setCell(dataRow, 8, row.submittedAt(), style);
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel export", e);
        }
    }

    private XSSFCellStyle buildHeaderStyle(XSSFWorkbook wb) {
        XSSFFont font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 11);

        XSSFCellStyle style = wb.createCellStyle();
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(
                new byte[]{(byte) 0x4B, (byte) 0x2E, (byte) 0x1F}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        applyBorders(style);
        return style;
    }

    private XSSFCellStyle buildDataStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(
                new byte[]{(byte) 0xFF, (byte) 0xFF, (byte) 0xFF}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        applyBorders(style);
        return style;
    }

    private XSSFCellStyle buildAltStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(
                new byte[]{(byte) 0xFB, (byte) 0xFA, (byte) 0xF7}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        applyBorders(style);
        return style;
    }

    private void applyBorders(XSSFCellStyle style) {
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(new XSSFColor(
                new byte[]{(byte) 0xEA, (byte) 0xDF, (byte) 0xD2}, null));
    }

    private void setCell(XSSFRow row, int col, String value, XSSFCellStyle style) {
        XSSFCell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    public LeadResponse createLead(LeadRequest request) {
        UUID id = UUID.randomUUID();
        Instant createdAt = Instant.now();

        leadRepository.save(id, request, createdAt);
        log.info(
                "Created landing lead {} type={} propertyType={} roomCount={}",
                id,
                request.leadType(),
                request.propertyType(),
                request.roomCount()
        );

        return new LeadResponse(id, "created", createdAt);
    }
}
