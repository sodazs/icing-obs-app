// Image and location handling
const images = {
    handleImageUpload(input) {
        if (input.files && input.files.length > 0) {
            Array.from(input.files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64 = e.target.result;
                    app.currentImages.push(base64);
                    images.renderGallery();
                    images.checkExifForLocation(base64);
                }
                reader.readAsDataURL(file);
            });
            input.value = '';
        }
    },

    removeImage(index) {
        app.currentImages.splice(index, 1);
        images.renderGallery();
    },

    renderGallery() {
        const gallery = document.getElementById('imageGallery');
        const container = document.getElementById('galleryContainer');
        const countSpan = document.getElementById('imgCount');
        
        gallery.innerHTML = '';
        countSpan.innerText = app.currentImages.length;

        if (app.currentImages.length > 0) {
            container.classList.remove('hidden');
            app.currentImages.forEach((imgSrc, index) => {
                const div = document.createElement('div');
                div.className = 'gallery-item';
                div.innerHTML = `
                    <img src="${imgSrc}" alt="img-${index}">
                    <div class="delete-btn" data-index="${index}">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                `;
                div.querySelector('.delete-btn').addEventListener('click', () => {
                    images.removeImage(index);
                });
                gallery.appendChild(div);
            });
        } else {
            container.classList.add('hidden');
        }
    },

    checkExifForLocation(base64) {
        if (document.getElementById('latitude').value) return;

        const tempImg = new Image();
        tempImg.src = base64;
        tempImg.onload = function() {
            EXIF.getData(tempImg, function() {
                const lat = EXIF.getTag(this, "GPSLatitude");
                const lon = EXIF.getTag(this, "GPSLongitude");
                const latRef = EXIF.getTag(this, "GPSLatitudeRef");
                const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

                if (lat && lon) {
                    const latDD = utils.convertDMSToDD(lat[0], lat[1], lat[2], latRef);
                    const lonDD = utils.convertDMSToDD(lon[0], lon[1], lon[2], lonRef);
                    images.updateLocationInputs(latDD, lonDD, "图片EXIF");
                    utils.showToast("已从图片提取位置");
                }
            });
        };
    },

    getCurrentLocation() {
        if (navigator.geolocation) {
            utils.showToast("正在获取定位...");
            
            const options = {
                timeout: 15000, // 延长到15秒
                enableHighAccuracy: false, // 改为false，降低要求
                maximumAge: 60000 // 使用1分钟内的缓存位置
            };
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    images.updateLocationInputs(lat, lng, "浏览器定位");
                    utils.showToast(`定位成功: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                },
                (error) => {
                    let errorMessage = "定位失败";
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "定位权限被拒绝，请检查浏览器设置或手动输入位置";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "无法获取位置信息，请检查网络连接或手动输入";
                            // 提供手动定位选项
                            this.suggestManualLocation();
                            break;
                        case error.TIMEOUT:
                            errorMessage = "定位超时，请重试或手动输入位置";
                            break;
                        default:
                            errorMessage = "定位服务不可用，请手动输入位置";
                            break;
                    }
                    
                    utils.showToast(errorMessage);
                    console.warn("定位错误详情:", error);
                    
                    // 降级方案：使用IP定位
                    this.fallbackToIPLocation();
                },
                options
            );
        } else {
            utils.showToast("浏览器不支持地理定位，请手动输入位置");
        }
    },

    // 降级方案：使用IP定位
    async fallbackToIPLocation() {
        try {
            utils.showToast("尝试通过IP获取大致位置...");
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            if (data.latitude && data.longitude) {
                images.updateLocationInputs(data.latitude, data.longitude, "IP定位");
                utils.showToast("已通过IP获取大致位置");
            }
        } catch (ipError) {
            console.log("IP定位也失败了:", ipError);
            // 最终降级：使用默认位置或保持空白
        }
    },
    // 提供手动定位建议
    suggestManualLocation() {
        const descInput = document.getElementById('locationDesc');
        if (!descInput.value) {
            descInput.placeholder = "请手动输入塔号或位置描述";
            descInput.focus();
        }
    },
    updateLocationInputs(lat, lng, source) {
        document.getElementById('latitude').value = parseFloat(lat).toFixed(6);
        document.getElementById('longitude').value = parseFloat(lng).toFixed(6);
        if(!document.getElementById('locationDesc').value) {
            document.getElementById('locationDesc').placeholder = `(${source})`;
            }
        }
}