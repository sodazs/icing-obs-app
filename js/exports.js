// Export functionality
const exports = {
    exportExcel() {
        const history = JSON.parse(localStorage.getItem('iceDataHistory') || '[]');
        if (!XLSX.utils){
            make_xlsx_lib(XLSX)
        }
        if (history.length === 0) { utils.showToast('无数据可导出'); return; }

        const flatData = history.map(item => ({
            时间: new Date(item.timestamp).toLocaleString(),
            覆冰类别: item.iceType,
            位置描述: item.location.desc,
            纬度: item.location.lat,
            经度: item.location.lng,
            气温: item.env.temp,
            风速: item.env.windSpeed,
            风向: item.env.windDir,
            长径: item.measurements.longD,
            短径: item.measurements.shortD,
            线径: item.measurements.wireD,
            每米冰重: item.results.netWeight,
            覆冰密度: item.results.density,
            标准冰厚: item.results.standardThickness
        }));

        const ws = XLSX.utils.json_to_sheet(flatData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "覆冰记录");
        XLSX.writeFile(wb, "覆冰观测数据.xlsx");
    },


    exportPDF() {
        const history = JSON.parse(localStorage.getItem('iceDataHistory') || '[]');
        if (history.length === 0) { utils.showToast('无数据可导出'); return; }
        const { jsPDF } = window.jspdfapplyPlugin;
        // applyPlugin(jsPDF);
        const doc = new jsPDF();
      
        doc.text("Ice Observation Report", 14, 20);
        const tableColumn = ["Time", "Type", "Location", "Density", "Thickness (mm)"];
        const tableRows = history.map(item => [
            item.timestamp.replace('T', ' '),
            item.iceType || '-',
            item.location.desc || 'N/A',
            item.results.density.toFixed(3),
            item.results.standardThickness.toFixed(1)
        ]);
        doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30 });
        doc.save("ice_observation_report.pdf");
    },

    exportKML() {
        const history = JSON.parse(localStorage.getItem('iceDataHistory') || '[]');
        if (history.length === 0) { utils.showToast('无数据可导出'); return; }

        let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>覆冰观测数据</name>
    <description>导出时间: ${new Date().toLocaleString()}</description>
    <Style id="icePoint">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/paddle/blu-circle.png</href></Icon>
      </IconStyle>
    </Style>`;

        let hasValidCoords = false;
        history.forEach(item => {
            const lat = parseFloat(item.location.lat);
            const lng = parseFloat(item.location.lng);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                hasValidCoords = true;
                const name = item.location.desc || `观测点 ${item.id}`;
                const desc = `
                    <b>时间:</b> ${new Date(item.timestamp).toLocaleString()}<br>
                    <b>类别:</b> ${item.iceType}<br>
                    <b>标准冰厚:</b> ${item.results.standardThickness.toFixed(2)} mm<br>
                    <b>覆冰密度:</b> ${item.results.density.toFixed(3)} g/cm³<br>
                    <b>气温:</b> ${item.env.temp || 'N/A'}°C
                `.trim();

                kmlContent += `
    <Placemark>
      <name>${name}</name>
      <styleUrl>#icePoint</styleUrl>
      <description><![CDATA[${desc}]]></description>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>`;
            }
        });

        kmlContent += `
  </Document>
</kml>`;

        if (!hasValidCoords) {
            alert("现有记录中没有有效的经纬度信息，无法生成有效的KML地图点。");
            return;
        }

        const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `覆冰分布_${new Date().toISOString().slice(0,10)}.kml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        utils.showToast("KML 导出成功");
    }
}