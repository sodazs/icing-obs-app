// Weather API functionality
const weather = {
    async fetchWeather() {
        let lat = document.getElementById('latitude').value;
        let lon = document.getElementById('longitude').value;

        const callApi = async (latitude, longitude) => {
            const btn = document.getElementById('fetch-weather-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 获取中...';
            btn.disabled = true;

            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.current_weather) {
                    document.getElementById('temperature').value = data.current_weather.temperature;
                    document.getElementById('windSpeed').value = data.current_weather.windspeed;
                    
                    const degrees = data.current_weather.winddirection;
                    const direction = utils.getWindDirection(degrees);
                    document.getElementById('windDirection').value = direction;
                    
                    utils.showToast("天气数据获取成功");
                } else {
                    utils.showToast("无法获取当前天气数据");
                }
            } catch (error) {
                console.error("Weather API Error:", error);
                utils.showToast("天气服务连接失败");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        };

        if (lat && lon) {
            await callApi(lat, lon);
        } else {
            if (navigator.geolocation) {
                utils.showToast("正在定位以获取天气...");
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        images.updateLocationInputs(position.coords.latitude, position.coords.longitude, "浏览器定位");
                        await callApi(position.coords.latitude, position.coords.longitude);
                    },
                    (error) => {
                        utils.showToast("定位失败，无法获取当地天气");
                    }
                );
            } else {
                utils.showToast("需先获取地理位置");
            }
        }
    }
}