package com.example.backend.service;

import com.example.backend.dto.StatsDto;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class ExcelExportService {

    public void exportStatsToExcel(StatsDto stats, HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition",
            "attachment; filename=Dashboard_Report_" + System.currentTimeMillis() + ".xlsx");

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Analytics Report");

            // Create all styles
            CellStyles styles = createStyles(wb);

            // Track row number
            int[] rowNum = {0};

            // Add title
            addTitle(sheet, rowNum, styles, "MG ECOMMERCE PLATFORM - ANALYTICS REPORT");

            // Add all sections
            addPlatformOverview(sheet, rowNum, styles, stats);
            addSalesMetrics(sheet, rowNum, styles, stats);
            addOrderStatus(sheet, rowNum, styles, stats);
            addPaymentStatus(sheet, rowNum, styles, stats);
            addInventory(sheet, rowNum, styles, stats);
            addCustomerMetrics(sheet, rowNum, styles, stats);
            addKPIs(sheet, rowNum, styles, stats);
            addTopProducts(sheet, rowNum, styles, stats);
            addCategoryRevenue(sheet, rowNum, styles, stats);
            addMonthlyRevenue(sheet, rowNum, styles, stats);

            // Set column widths
            sheet.setColumnWidth(0, 35 * 256);
            sheet.setColumnWidth(1, 25 * 256);
            sheet.setColumnWidth(2, 20 * 256);

            // Freeze header
            sheet.createFreezePane(0, 1);

            wb.write(response.getOutputStream());
        }
    }

    private CellStyles createStyles(Workbook wb) {
        CellStyles s = new CellStyles();

        s.title = wb.createCellStyle();
        Font titleFont = wb.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleFont.setColor(IndexedColors.WHITE.getIndex());
        s.title.setFont(titleFont);
        s.title.setFillForegroundColor(new XSSFColor(new byte[]{(byte)30,(byte)58,(byte)138}, null));
        s.title.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.title.setAlignment(HorizontalAlignment.CENTER);
        s.title.setVerticalAlignment(VerticalAlignment.CENTER);

        s.section = wb.createCellStyle();
        Font sectionFont = wb.createFont();
        sectionFont.setBold(true);
        sectionFont.setFontHeightInPoints((short) 11);
        sectionFont.setColor(IndexedColors.WHITE.getIndex());
        s.section.setFont(sectionFont);
        s.section.setFillForegroundColor(new XSSFColor(new byte[]{(byte)37,(byte)99,(byte)235}, null));
        s.section.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.section.setAlignment(HorizontalAlignment.CENTER);
        s.section.setVerticalAlignment(VerticalAlignment.CENTER);

        s.header = wb.createCellStyle();
        Font headerFont = wb.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 10);
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        s.header.setFont(headerFont);
        s.header.setFillForegroundColor(new XSSFColor(new byte[]{(byte)71,(byte)85,(byte)105}, null));
        s.header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addBorders(s.header);
        s.header.setAlignment(HorizontalAlignment.CENTER);
        s.header.setVerticalAlignment(VerticalAlignment.CENTER);

        s.label = wb.createCellStyle();
        Font labelFont = wb.createFont();
        labelFont.setBold(true);
        labelFont.setFontHeightInPoints((short) 10);
        s.label.setFont(labelFont);
        s.label.setFillForegroundColor(new XSSFColor(new byte[]{(byte)241,(byte)245,(byte)249}, null));
        s.label.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addBorders(s.label);
        s.label.setAlignment(HorizontalAlignment.LEFT);
        s.label.setVerticalAlignment(VerticalAlignment.CENTER);

        s.value = wb.createCellStyle();
        s.value.setFont(wb.createFont());
        addBorders(s.value);
        s.value.setAlignment(HorizontalAlignment.CENTER);
        s.value.setVerticalAlignment(VerticalAlignment.CENTER);

        s.altValue = wb.createCellStyle();
        s.altValue.setFillForegroundColor(new XSSFColor(new byte[]{(byte)248,(byte)250,(byte)252}, null));
        s.altValue.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addBorders(s.altValue);
        s.altValue.setAlignment(HorizontalAlignment.CENTER);
        s.altValue.setVerticalAlignment(VerticalAlignment.CENTER);

        return s;
    }

    private void addBorders(CellStyle style) {
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private void addTitle(Sheet sheet, int[] rowNum, CellStyles styles, String title) {
        Row titleRow = sheet.createRow(rowNum[0]++);
        titleRow.setHeightInPoints(42);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(title + "\n" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        CellStyle titleStyle = sheet.getWorkbook().createCellStyle();
        titleStyle.cloneStyleFrom(styles.title);
        titleStyle.setWrapText(true);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(titleRow.getRowNum(), titleRow.getRowNum(), 0, 1));
    }

    private void addSection(Sheet sheet, int[] rowNum, CellStyles styles, String title, int mergeColumns) {
        Row r = sheet.createRow(rowNum[0]++);
        r.setHeightInPoints(20);
        Cell c = r.createCell(0);
        c.setCellValue(title);
        c.setCellStyle(styles.section);
        sheet.addMergedRegion(new CellRangeAddress(r.getRowNum(), r.getRowNum(), 0, mergeColumns));
    }

    private void addHeaderRow(Sheet sheet, int[] rowNum, CellStyles styles, String[] headers) {
        Row r = sheet.createRow(rowNum[0]++);
        r.setHeightInPoints(22);
        for (int i = 0; i < headers.length; i++) {
            Cell c = r.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(styles.header);
        }
    }

    private void addDataRow(Sheet sheet, int[] rowNum, CellStyles styles, Object[] values, boolean alternate) {
        Row r = sheet.createRow(rowNum[0]++);
        CellStyle rowStyle = alternate ? styles.altValue : styles.value;
        for (int i = 0; i < values.length; i++) {
            Cell c = r.createCell(i);
            if (values[i] instanceof Number) {
                c.setCellValue(((Number) values[i]).doubleValue());
            } else {
                c.setCellValue(values[i] != null ? values[i].toString() : "");
            }
            CellStyle cellStyle = sheet.getWorkbook().createCellStyle();
            cellStyle.cloneStyleFrom(i == 0 ? styles.label : rowStyle);
            cellStyle.setAlignment(HorizontalAlignment.CENTER);
            cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            addBorders(cellStyle);
            c.setCellStyle(cellStyle);
        }
    }

    private void addPlatformOverview(Sheet sheet, int[] rowNum, CellStyles styles, StatsDto stats) {
        addSection(sheet, rowNum, styles, "PLATFORM OVERVIEW", 1);
        addHeaderRow(sheet, rowNum, styles, new String[]{"Metric", "Value"});
        boolean alt = false;
        addDataRow(sheet, rowNum, styles, new Object[]{"Platform Health Score", String.format(Locale.US, "%.2f%%", stats.getPlatformHealthScore())}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Total Active Users", stats.getTotalUsers()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Total Orders", stats.getTotalOrders()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Total Products", stats.getTotalProducts()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Total Categories", stats.getTotalCategories()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Total Revenue", String.format(Locale.US, "%.2f TND", stats.getTotalRevenue())}, alt = !alt);
    }

    private void addSalesMetrics(Sheet sheet, int[] rowNum, CellStyles styles, StatsDto stats) {
        addSection(sheet, rowNum, styles, "SALES & REVENUE METRICS", 1);
        addHeaderRow(sheet, rowNum, styles, new String[]{"Metric", "Value"});
        boolean alt = false;
        addDataRow(sheet, rowNum, styles, new Object[]{"Total Revenue All Time", String.format(Locale.US, "%.2f TND", stats.getTotalRevenue())}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Average Order Value", String.format(Locale.US, "%.2f TND", stats.getAverageOrderValue())}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Average Revenue per User", String.format(Locale.US, "%.2f TND", stats.getAverageRevenuePerUser())}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Orders This Month", stats.getOrdersThisMonth()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Revenue This Month", String.format(Locale.US, "%.2f TND", stats.getRevenueThisMonth())}, alt = !alt);
    }

    private void addOrderStatus(Sheet sheet, int[] rowNum, CellStyles styles, StatsDto stats) {
        addSection(sheet, rowNum, styles, "ORDER STATUS BREAKDOWN", 1);
        addHeaderRow(sheet, rowNum, styles, new String[]{"Status", "Count"});
        boolean alt = false;
        addDataRow(sheet, rowNum, styles, new Object[]{"Pending", stats.getPendingOrders()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Confirmed", stats.getConfirmedOrders()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Shipped", stats.getShippedOrders()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Delivered", stats.getDeliveredOrders()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Cancelled", stats.getCancelledOrders()}, alt = !alt);
    }

    private void addPaymentStatus(Sheet sheet, int[] rowNum, CellStyles styles, StatsDto stats) {
        long totalPay = stats.getCompletedPayments() + stats.getPendingPayments() + stats.getFailedPayments();
        double successRate = totalPay > 0 ? (stats.getCompletedPayments() * 100.0) / totalPay : 0;

        addSection(sheet, rowNum, styles, "PAYMENT STATUS", 1);
        addHeaderRow(sheet, rowNum, styles, new String[]{"Status", "Count"});
        boolean alt = false;
        addDataRow(sheet, rowNum, styles, new Object[]{"Completed", stats.getCompletedPayments()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Pending", stats.getPendingPayments()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Failed", stats.getFailedPayments()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Success Rate", String.format(Locale.US, "%.2f%%", successRate)}, alt = !alt);
    }

    private void addInventory(Sheet sheet, int[] rowNum, CellStyles styles, StatsDto stats) {
        addSection(sheet, rowNum, styles, "INVENTORY & PRODUCTS", 1);
        addHeaderRow(sheet, rowNum, styles, new String[]{"Metric", "Value"});
        boolean alt = false;
        addDataRow(sheet, rowNum, styles, new Object[]{"Total Products", stats.getTotalProducts()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Active Products", stats.getActiveProducts()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Total Categories", stats.getTotalCategories()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Average Product Price", String.format(Locale.US, "%.2f TND", stats.getAverageProductPrice())}, alt = !alt);
    }

    private void addCustomerMetrics(Sheet sheet, int[] rowNum, CellStyles styles, StatsDto stats) {
        double retention = stats.getTotalUsers() > 0 ? (stats.getReturningCustomers() * 100.0) / stats.getTotalUsers() : 0;
        addSection(sheet, rowNum, styles, "CUSTOMER METRICS", 1);
        addHeaderRow(sheet, rowNum, styles, new String[]{"Metric", "Value"});
        boolean alt = false;
        addDataRow(sheet, rowNum, styles, new Object[]{"Total Active Users", stats.getTotalUsers()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"New Users This Month", stats.getNewUsersThisMonth()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Returning Customers", stats.getReturningCustomers()}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Retention Rate", String.format(Locale.US, "%.2f%%", retention)}, alt = !alt);
    }

    private void addKPIs(Sheet sheet, int[] rowNum, CellStyles styles, StatsDto stats) {
        double conversionRate = stats.getTotalUsers() > 0 ? (stats.getTotalOrders() * 100.0) / stats.getTotalUsers() : 0;
        double revenuePerProduct = stats.getTotalProducts() > 0 ? stats.getTotalRevenue() / stats.getTotalProducts() : 0;
        addSection(sheet, rowNum, styles, "KEY PERFORMANCE INDICATORS", 1);
        addHeaderRow(sheet, rowNum, styles, new String[]{"Indicator", "Value"});
        boolean alt = false;
        addDataRow(sheet, rowNum, styles, new Object[]{"Platform Health Score", String.format(Locale.US, "%.2f%%", stats.getPlatformHealthScore())}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Conversion Rate", String.format(Locale.US, "%.2f%%", conversionRate)}, alt = !alt);
        addDataRow(sheet, rowNum, styles, new Object[]{"Revenue per Product", String.format(Locale.US, "%.2f TND", revenuePerProduct)}, alt = !alt);
    }

    private void addTopProducts(Sheet sheet, int[] rowNum, CellStyles styles, StatsDto stats) {
        addSection(sheet, rowNum, styles, "TOP SELLING PRODUCTS", 2);
        addHeaderRow(sheet, rowNum, styles, new String[]{"Product", "Qty Sold", "Revenue (TND)"});
        boolean alt = false;
        if (stats.getTopSellingProducts() != null && !stats.getTopSellingProducts().isEmpty()) {
            for (var p : stats.getTopSellingProducts()) {
                String name = (String) p.get("name");
                long qty = p.get("total_sold") != null ? ((Number) p.get("total_sold")).longValue() : 0L;
                double rev = p.get("revenue") != null ? (Double) p.get("revenue") : 0.0;
                addDataRow(sheet, rowNum, styles, new Object[]{name, qty, String.format(Locale.US, "%.2f", rev)}, alt = !alt);
            }
        } else {
            addDataRow(sheet, rowNum, styles, new Object[]{"No data", 0, "0.00"}, false);
        }
    }

    private void addCategoryRevenue(Sheet sheet, int[] rowNum, CellStyles styles, StatsDto stats) {
        addSection(sheet, rowNum, styles, "CATEGORY REVENUE BREAKDOWN", 1);
        addHeaderRow(sheet, rowNum, styles, new String[]{"Category", "Revenue (TND)"});
        boolean alt = false;
        if (stats.getCategoryRevenue() != null && !stats.getCategoryRevenue().isEmpty()) {
            for (var cat : stats.getCategoryRevenue()) {
                String category = (String) cat.get("category");
                double rev = cat.get("revenue") != null ? (Double) cat.get("revenue") : 0.0;
                addDataRow(sheet, rowNum, styles, new Object[]{category, String.format(Locale.US, "%.2f", rev)}, alt = !alt);
            }
        } else {
            addDataRow(sheet, rowNum, styles, new Object[]{"No data", "0.00"}, false);
        }
    }

    private void addMonthlyRevenue(Sheet sheet, int[] rowNum, CellStyles styles, StatsDto stats) {
        addSection(sheet, rowNum, styles, "MONTHLY REVENUE TREND", 1);
        addHeaderRow(sheet, rowNum, styles, new String[]{"Month", "Revenue (TND)"});
        boolean alt = false;
        if (stats.getMonthlyRevenueTrend() != null && !stats.getMonthlyRevenueTrend().isEmpty()) {
            for (var m : stats.getMonthlyRevenueTrend()) {
                String month = (String) m.get("month");
                double rev = m.get("revenue") != null ? (Double) m.get("revenue") : 0.0;
                addDataRow(sheet, rowNum, styles, new Object[]{month, String.format(Locale.US, "%.2f", rev)}, alt = !alt);
            }
        } else {
            addDataRow(sheet, rowNum, styles, new Object[]{"No data", "0.00"}, false);
        }
    }

    private static class CellStyles {
        CellStyle title, section, header, label, value, altValue;
    }
}
