package com.attendance.fpt.utils;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class BaseExport {
    private final XSSFWorkbook workbook = new XSSFWorkbook();
    private final Map<String, XSSFSheet> sheetMap = new HashMap<>();
    private final Map<String, ExportSheet> sheetDataMap = new HashMap<>();

    public BaseExport addSheet(String sheetName, List<?> data, Class<?> clazz, String[] fields) {
        sheetDataMap.put(sheetName, new ExportSheet(data, clazz, fields));
        return this;
    }

    public BaseExport writeHeaderLine(String[] headers, String sheetName) {
        XSSFSheet sheet = workbook.createSheet(sheetName);
        sheetMap.put(sheetName, sheet);

        Row row = sheet.createRow(0);
        CellStyle style = createHeaderStyle();

        for (int i = 0; i < headers.length; i++) {
            createCell(row, i, headers[i], style);
        }

        return this;
    }

    public BaseExport writeDataLines(String sheetName) {
        XSSFSheet sheet = sheetMap.get(sheetName);
        ExportSheet exportSheet = sheetDataMap.get(sheetName);

        if (sheet == null || exportSheet == null) {
            throw new IllegalArgumentException("Sheet '" + sheetName + "' not initialized properly.");
        }

        List<?> dataList = exportSheet.data;
        Class<?> clazz = exportSheet.clazz;
        String[] fields = exportSheet.fields;

        CellStyle style = createBodyStyle();
        int rowCount = 1;

        for (Object data : dataList) {
            Row row = sheet.createRow(rowCount);
            int col = 0;

            createCell(row, col++, rowCount, style);

            for (String fieldName : fields) {
                try {
                    // Truy cập vào các trường lồng nhau (ví dụ: workShift.name)
                    Object value = getNestedFieldValue(data, fieldName);
                    createCell(row, col++, value, style);
                } catch (Exception e) {
                    throw new RuntimeException("Error accessing field: " + fieldName, e);
                }
            }

            rowCount++;
        }

        for (int i = 0; i < fields.length + 1; i++) {
            sheet.autoSizeColumn(i);
        }

        return this;
    }

    private Object getNestedFieldValue(Object data, String fieldName) throws Exception {
        String[] fieldParts = fieldName.split("\\."); // Chia tên trường nếu có dấu "."
        Object currentObject = data;

        for (String field : fieldParts) {
            Field declaredField = currentObject.getClass().getDeclaredField(field);
            declaredField.setAccessible(true);

            // Cập nhật currentObject với giá trị của trường đó
            currentObject = declaredField.get(currentObject);

            // Nếu trường là null thì không tiếp tục nữa
            if (currentObject == null) {
                return null;
            }
        }

        return currentObject;
    }



    public void export(HttpServletResponse response) throws IOException {
        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
        outputStream.close();
    }

    private void createCell(Row row, int col, Object value, CellStyle style) {
        Cell cell = row.createCell(col);

        if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        } else if (value instanceof Long) {
            cell.setCellValue((Long) value);
        } else if (value instanceof Double) {
            cell.setCellValue((Double) value);
        } else if (value instanceof LocalDateTime) {
            cell.setCellValue(DateUtil.formatLocalDateTime((LocalDateTime) value));
        } else if (value instanceof LocalDate) {
            cell.setCellValue(DateUtil.formatDate((LocalDate) value));
        } else if (value instanceof Boolean) {
            cell.setCellValue( (Boolean) value ? "Có" : "Không");
        } else {
            cell.setCellValue(value != null ? value.toString() : "");
        }

        cell.setCellStyle(style);
    }

    private CellStyle createHeaderStyle() {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeight(13);
        font.setFontName("Times New Roman");
        style.setFont(font);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createBodyStyle() {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setFontHeight(13);
        font.setFontName("Times New Roman");
        style.setFont(font);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private static class ExportSheet {
        List<?> data;
        Class<?> clazz;
        String[] fields;

        ExportSheet(List<?> data, Class<?> clazz, String[] fields) {
            this.data = data;
            this.clazz = clazz;
            this.fields = fields;
        }
    }
}
