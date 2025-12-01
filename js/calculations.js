// Ice calculation logic
const calculations = {
    calculateIce() {
        const L_cm = parseFloat(document.getElementById('iceLength').value);
        const D_long_mm = parseFloat(document.getElementById('longDiameter').value);
        const D_short_mm = parseFloat(document.getElementById('shortDiameter').value);
        const D_wire_mm = parseFloat(document.getElementById('wireDiameter').value) || 0; 
        const W_total_g = parseFloat(document.getElementById('totalWeight').value);
        const W_bucket_g = parseFloat(document.getElementById('bucketWeight').value) || 0;

        if (!L_cm || !D_long_mm || !D_short_mm || isNaN(W_total_g)) {
            utils.showToast('请填写所有带 * 号的必填项');
            return false;
        }

        const G_ice_g = (W_total_g - W_bucket_g);
        const M_per_m = G_ice_g*(100/L_cm);
        if (G_ice_g < 0) {
            utils.showToast('错误：皮重不能大于总重');
            return false;
        }

        //const D_eq_mm = (D_long_mm + D_short_mm) / 2;
        //const D_eq_cm = D_eq_mm / 10;
        //const Radius_cm = D_eq_cm / 2;
        const Volume_mm3 = Math.PI * (D_long_mm*D_short_mm-Math.pow(D_wire_mm, 2))/4;
        
        let density = 0;
        if (Volume_mm3 > 0) {
            density = M_per_m / Volume_mm3;
        }

        let standardThickness_mm = 0;
        const rho_standard = 0.9;
        
        if (D_wire_mm > 0) {
            //const M_per_cm = G_ice_g / L_cm;
            const R_wire_mm = D_wire_mm  / 2;
            const term1 = M_per_m / (Math.PI * rho_standard);
            const term2 = Math.pow(R_wire_mm, 2);
            const R_total_mm = Math.sqrt(term1 + term2);
            standardThickness_mm = (R_total_mm - R_wire_mm); 
        }

        document.getElementById('res-netWeight').innerText = G_ice_g.toFixed(1);
        document.getElementById('res-netWeight-per-m').innerText = M_per_m.toFixed(1);
        document.getElementById('res-density').innerText = density.toFixed(3);
        document.getElementById('res-thickness').innerText = standardThickness_mm.toFixed(1);
        
        document.getElementById('resultArea').classList.remove('hidden');

        app.currentCalculations = {
            netWeight: G_ice_g,
            density: density,
            standardThickness: standardThickness_mm
        };
        
        return true;
    }
}