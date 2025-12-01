// Main Application Controller
class IceObservationApp {
    constructor() {
        this.currentCalculations = null;
        this.currentImages = [];
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeDateTime();
            this.bindEvents();
            storage.loadHistory();
        });
    }

    initializeDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('recordTime').value = now.toISOString().slice(0, 16);
    }

    bindEvents() {
        // Tab navigation
        document.getElementById('tab-record').addEventListener('click', () => this.switchTab('record'));
        document.getElementById('tab-history').addEventListener('click', () => this.switchTab('history'));

        // Form actions
        document.getElementById('fetch-weather-btn').addEventListener('click', () => weather.fetchWeather());
        document.getElementById('calculate-btn').addEventListener('click', () => calculations.calculateIce());
        document.getElementById('location-btn').addEventListener('click', () => images.getCurrentLocation());
        document.getElementById('save-btn').addEventListener('click', () => this.saveRecord());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetForm());

        // Export actions
        document.getElementById('export-excel-btn').addEventListener('click', () => exports.exportExcel());
        document.getElementById('export-pdf-btn').addEventListener('click', () => exports.exportPDF());
        document.getElementById('export-kml-btn').addEventListener('click', () => exports.exportKML());
        document.getElementById('clear-history-btn').addEventListener('click', () => storage.clearHistory());

        // Image upload
        document.getElementById('photoInput').addEventListener('change', (e) => images.handleImageUpload(e.target));
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');

        if (tabName === 'record') {
            document.getElementById('view-record').classList.remove('hidden');
            document.getElementById('view-history').classList.add('hidden');
        } else {
            document.getElementById('view-record').classList.add('hidden');
            document.getElementById('view-history').classList.remove('hidden');
            storage.loadHistory(); 
        }
    }

    saveRecord() {
        if(!this.currentCalculations) {
            const success = calculations.calculateIce();
            if (!success) return;
        }

        try {
            const record = {
                id: Date.now(),
                timestamp: document.getElementById('recordTime').value,
                iceType: document.getElementById('iceType').value,
                env: {
                    temp: document.getElementById('temperature').value,
                    windSpeed: document.getElementById('windSpeed').value,
                    windDir: document.getElementById('windDirection').value
                },
                measurements: {
                    longD: document.getElementById('longDiameter').value,
                    shortD: document.getElementById('shortDiameter').value,
                    wireD: document.getElementById('wireDiameter').value,
                    length: document.getElementById('iceLength').value,
                    totalW: document.getElementById('totalWeight').value,
                    bucketW: document.getElementById('bucketWeight').value
                },
                results: this.currentCalculations,
                location: {
                    lat: document.getElementById('latitude').value,
                    lng: document.getElementById('longitude').value,
                    desc: document.getElementById('locationDesc').value
                },
                images: this.currentImages
            };

            storage.saveRecord(record);
            this.simulateUpload(record);

        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('本地存储空间已满！请先导出并清空历史记录，或减少图片数量/大小。');
            } else {
                alert('保存失败: ' + e.message);
            }
        }
    }

    simulateUpload(data) {
        const btn = document.getElementById('save-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 上传中...';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            utils.showToast("保存本地并上传成功！");
            this.resetForm();
            this.switchTab('history');
        }, 1000);
    }

    resetForm() {
        document.getElementById('measureForm').reset();
        document.getElementById('resultArea').classList.add('hidden');
        this.currentImages = [];
        images.renderGallery();
        document.getElementById('photoInput').value = '';
        this.currentCalculations = null;
    }
}

// Utility functions
const utils = {
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    getWindDirection(degrees) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    },

    convertDMSToDD(degrees, minutes, seconds, direction) {
        let dd = degrees + minutes / 60 + seconds / (60 * 60);
        if (direction == "S" || direction == "W") {
            dd = dd * -1;
        }
        return dd;
    }
}

// Initialize the application
const app = new IceObservationApp();