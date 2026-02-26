/**
 * Universal Data Export Utility
 * Handles conversion of JSON objects to CSV string and triggers browser download.
 */

export const exportToCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) return;

    // Extract headers from the first object keys
    const headers = Object.keys(data[0]);

    // Create CSV rows
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            // Handle commas and quotes in values
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    // Combine into a single string with UTF-8 BOM for Arabic support in Excel
    const csvString = '\uFEFF' + csvRows.join('\n');

    // Create blob and trigger download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
