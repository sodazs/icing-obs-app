// Data storage and management
const storage = {
    saveRecord(record) {
        let history = JSON.parse(localStorage.getItem('iceDataHistory') || '[]');
        history.unshift(record);
        localStorage.setItem('iceDataHistory', JSON.stringify(history));
    },

    loadHistory() {
        const history = JSON.parse(localStorage.getItem('iceDataHistory') || '[]');
        const tbody = document.getElementById('historyTableBody');
        const emptyState = document.getElementById('emptyState');
        
        tbody.innerHTML = '';
        
        if (history.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        } else {
            emptyState.classList.add('hidden');
        }

        history.forEach(item => {
            const imgCount = item.images ? item.images.length : (item.image ? 1 : 0);
            const tr = document.createElement('tr');
            tr.className = "bg-white border-b hover:bg-gray-50";
            tr.innerHTML = `
                <td class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">${new Date(item.timestamp).toLocaleString()}</td>
                <td class="px-4 py-3"><span class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">${item.iceType || '未分类'}</span></td>
                <td class="px-4 py-3">${item.location.desc || '未命名'}</td>
                <td class="px-4 py-3">${item.results.density.toFixed(3)}</td>
                <td class="px-4 py-3 font-bold text-blue-600">${item.results.standardThickness.toFixed(1)}</td>
                <td class="px-4 py-3 text-xs text-gray-500">${imgCount} 张</td>
                <td class="px-4 py-3">
                    <button class="delete-record-btn text-red-600 hover:text-red-800" data-id="${item.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            
            tr.querySelector('.delete-record-btn').addEventListener('click', () => {
                storage.deleteRecord(item.id);
            });
            
            tbody.appendChild(tr);
        });
    },

    deleteRecord(id) {
        if(confirm('确定删除这条记录吗？')) {
            let history = JSON.parse(localStorage.getItem('iceDataHistory') || '[]');
            history = history.filter(item => item.id !== id);
            localStorage.setItem('iceDataHistory', JSON.stringify(history));
            storage.loadHistory();
            utils.showToast("记录已删除");
        }
    },

    clearHistory() {
        if(confirm('确定清空所有本地记录吗？')) {
            localStorage.removeItem('iceDataHistory');
            storage.loadHistory();
            utils.showToast("历史记录已清空");
        }
    }
}