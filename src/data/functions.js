import * as XLSX from "xlsx";

export const onDownloadCurrentList = (filename, tableData) => {
        // Remove unwanted fields if needed, or just export as is
        const exportData = tableData.map(({ id, ...rest }) => rest); // remove 'id' if not needed
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `${filename}`);
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };