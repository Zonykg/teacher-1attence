let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

 
    window.onload = function() {
        updateCurrentDate();
        document.getElementById('attDate').valueAsDate = new Date();
        renderTeacherSelect();
        renderTable();
        updateStats();
        setupFilters();
    };

   
    function updateCurrentDate() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const date = new Date().toLocaleDateString('mn-MN', options);
        document.getElementById('currentDate').textContent = date;
    }

    function showSuccess(message) {
        const successMsg = document.getElementById('successMessage');
        const successText = document.getElementById('successText');
        successText.textContent = message;
        successMsg.classList.add('show');
        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 3000);
    }

    document.getElementById('teacherForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const teacher = {
            id: Date.now(),
            name: document.getElementById('teacherName').value,
            subject: document.getElementById('teacherSubject').value,
            phone: document.getElementById('teacherPhone').value,
            email: document.getElementById('teacherEmail').value,
            createdAt: new Date().toISOString()
        };

        teachers.push(teacher);
        localStorage.setItem('teachers', JSON.stringify(teachers));
        
        this.reset();
        renderTeacherSelect();
        showSuccess('Багш амжилттай нэмэгдлээ!');
    });

   
    function renderTeacherSelect() {
        const select = document.getElementById('selectTeacher');
        select.innerHTML = '<option value="">Багш сонгоно уу</option>';
        
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = `${teacher.name} - ${teacher.subject}`;
            select.appendChild(option);
        });
    }

   
    document.getElementById('attendanceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const teacherId = parseInt(document.getElementById('selectTeacher').value);
        const teacher = teachers.find(t => t.id === teacherId);
        
        if (!teacher) {
            alert('Багш сонгоно уу!');
            return;
        }

        const attendance = {
            id: Date.now(),
            teacherId: teacher.id,
            teacherName: teacher.name,
            subject: teacher.subject,
            date: document.getElementById('attDate').value,
            status: document.querySelector('input[name="status"]:checked').value,
            notes: document.getElementById('attNotes').value,
            createdAt: new Date().toISOString()
        };

        attendanceRecords.unshift(attendance);
        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
        
        this.reset();
        document.getElementById('attDate').valueAsDate = new Date();
        document.getElementById('present').checked = true;
        
        renderTable();
        updateStats();
        showSuccess('Ирц амжилттай бүртгэгдлээ!');
    });


    function updateStats() {
        const present = attendanceRecords.filter(r => r.status === 'present').length;
        const absent = attendanceRecords.filter(r => r.status === 'absent').length;
        const late = attendanceRecords.filter(r => r.status === 'late').length;
        const total = attendanceRecords.length;

        document.getElementById('presentCount').textContent = present;
        document.getElementById('absentCount').textContent = absent;
        document.getElementById('lateCount').textContent = late;
        document.getElementById('totalCount').textContent = total;
    }

  
    function renderTable(data = attendanceRecords) {
        const tbody = document.getElementById('attendanceBody');
        const emptyState = document.getElementById('emptyState');
        
        if (data.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tbody.innerHTML = data.map((record, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${record.teacherName}</td>
                <td>${record.subject}</td>
                <td>${new Date(record.date).toLocaleDateString('mn-MN')}</td>
                <td><span class="status-badge status-${record.status}">${getStatusText(record.status)}</span></td>
                <td>${record.notes || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-edit" onclick="editRecord(${record.id})">✏️ Засах</button>
                        <button class="btn-delete" onclick="deleteRecord(${record.id})">🗑️ Устгах</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function getStatusText(status) {
        const statusMap = {
            'present': 'Ирсэн',
            'absent': 'Тасалсан',
            'late': 'Хоцорсон'
        };
        return statusMap[status] || status;
    }

   
    function editRecord(id) {
        const record = attendanceRecords.find(r => r.id === id);
        if (!record) return;

        document.getElementById('editId').value = record.id;
        document.getElementById('editDate').value = record.date;
        document.getElementById('editNotes').value = record.notes || '';
        
        document.getElementById(`edit${record.status.charAt(0).toUpperCase() + record.status.slice(1)}`).checked = true;
        
        document.getElementById('editModal').classList.add('active');
    }

   
    function closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
    }


    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = parseInt(document.getElementById('editId').value);
        const index = attendanceRecords.findIndex(r => r.id === id);
        
        if (index === -1) return;

        attendanceRecords[index].date = document.getElementById('editDate').value;
        attendanceRecords[index].status = document.querySelector('input[name="editStatus"]:checked').value;
        attendanceRecords[index].notes = document.getElementById('editNotes').value;

        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
        
        renderTable();
        updateStats();
        closeEditModal();
        showSuccess('Ирц амжилттай засагдлаа!');
    });

   
    function deleteRecord(id) {
        if (!confirm('Энэ бүртгэлийг устгах уу?')) return;

        attendanceRecords = attendanceRecords.filter(r => r.id !== id);
        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
        
        renderTable();
        updateStats();
        showSuccess('Ирц устгагдлаа!');
    }

   
    function setupFilters() {
        const searchInput = document.getElementById('searchInput');
        const filterDate = document.getElementById('filterDate');
        const filterStatus = document.getElementById('filterStatus');

        [searchInput, filterDate, filterStatus].forEach(element => {
            element.addEventListener('input', applyFilters);
        });
    }

    
    function applyFilters() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const dateFilter = document.getElementById('filterDate').value;
        const statusFilter = document.getElementById('filterStatus').value;

        let filtered = attendanceRecords.filter(record => {
            const matchSearch = record.teacherName.toLowerCase().includes(searchTerm) ||
                              record.subject.toLowerCase().includes(searchTerm);
            const matchDate = !dateFilter || record.date === dateFilter;
            const matchStatus = !statusFilter || record.status === statusFilter;

            return matchSearch && matchDate && matchStatus;
        });

        renderTable(filtered);
    }

   
    function resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('filterDate').value = '';
        document.getElementById('filterStatus').value = '';
        renderTable();
    }

   
    function exportData() {
        if (attendanceRecords.length === 0) {
            alert('Экспорт хийх өгөгдөл байхгүй байна!');
            return;
        }

        let csv = 'Багш,Хичээл,Огноо,Төлөв,Тэмдэглэл\n';
        
        attendanceRecords.forEach(record => {
            csv += `"${record.teacherName}","${record.subject}","${record.date}","${getStatusText(record.status)}","${record.notes || ''}"\n`;
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `irts-burtgel-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Excel файл татагдаж байна!');
    }

  
    window.onclick = function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeEditModal();
        }
    }
