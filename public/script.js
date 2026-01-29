const API_URL = "http://localhost:3000";
let db = { posts: [], comments: [] };
let currentPostIdForCmt = null;
let cmtModal;

// 1. KHỞI TẠO KHI LOAD TRANG
document.addEventListener('DOMContentLoaded', async () => {
    cmtModal = new bootstrap.Modal(document.getElementById('commentModal'));
    await loadDataFromServer();
});

// 2. TẢI DỮ LIỆU TỪ DB.JSON
async function loadDataFromServer() {
    try {
        const [resPosts, resCmts] = await Promise.all([
            fetch(`${API_URL}/posts`),
            fetch(`${API_URL}/comments`)
        ]);

        db.posts = await resPosts.json();
        db.comments = await resCmts.json();

        console.log("Dữ liệu đã tải:", db);
        renderPosts();
    } catch (error) {
        console.error("Không thể kết nối JSON Server!", error);
        document.getElementById('post-table-body').innerHTML = 
            `<tr><td colspan="4" class="text-center text-danger">Lỗi: Hãy chạy lệnh <b>json-server --watch db.json</b></td></tr>`;
    }
}

// 3. VẼ BẢNG POST
function renderPosts() {
    const tbody = document.getElementById('post-table-body');
    tbody.innerHTML = db.posts.map(p => {
        // Lọc bình luận dựa trên postId (ép về chuỗi để so sánh chuẩn)
        const count = db.comments.filter(c => String(c.postId) === String(p.id)).length;
        
        return `
            <tr class="post-row">
                <td><span class="fw-bold">${p.id}</span></td>
                <td>
                    <div class="fw-bold text-secondary">${p.title}</div>
                    <button class="btn btn-sm btn-link p-0 text-decoration-none" onclick="openComments('${p.id}')">
                        <i class="bi bi-chat-dots"></i> ${count} bình luận
                    </button>
                </td>
                <td><span class="badge badge-views rounded-pill">${p.views} views</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="deletePost('${p.id}')">
                        <i class="bi bi-trash"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 4. MỞ MODAL & HIỂN THỊ CMT
window.openComments = function(postId) {
    currentPostIdForCmt = String(postId);
    resetCmtForm();
    renderCommentsInModal();
    cmtModal.show();
};

function renderCommentsInModal() {
    const list = document.getElementById('comment-list');
    const filtered = db.comments.filter(c => String(c.postId) === currentPostIdForCmt);
    
    list.innerHTML = filtered.map(c => `
        <div class="p-3 mb-2 bg-light rounded border-start border-primary border-4 d-flex justify-content-between">
            <span>${c.text}</span>
            <div>
                <i class="bi bi-pencil text-primary me-2" style="cursor:pointer" onclick="prepareEditCmt('${c.id}')"></i>
                <i class="bi bi-x-circle text-danger" style="cursor:pointer" onclick="deleteComment('${c.id}')"></i>
            </div>
        </div>
    `).join('') || '<div class="text-center text-muted">Chưa có bình luận nào.</div>';
}

// 5. LƯU BÌNH LUẬN (THÊM & SỬA) VÀO DB.JSON
window.saveComment = async function() {
    const text = document.getElementById('cmtText').value;
    const editId = document.getElementById('editCmtId').value;
    if (!text.trim()) return;

    if (editId) {
        // SỬA (PUT)
        await fetch(`${API_URL}/comments/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, postId: currentPostIdForCmt })
        });
    } else {
        // THÊM (POST) - ID TỰ TĂNG
        const nextId = String(db.comments.length > 0 ? Math.max(...db.comments.map(c => parseInt(c.id))) + 1 : 1);
        await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: nextId, text, postId: currentPostIdForCmt })
        });
    }

    await loadDataFromServer(); // Tải lại db
    renderCommentsInModal();    // Vẽ lại modal
    resetCmtForm();
};

window.prepareEditCmt = function(id) {
    const cmt = db.comments.find(c => String(c.id) === String(id));
    if (cmt) {
        document.getElementById('editCmtId').value = cmt.id;
        document.getElementById('cmtText').value = cmt.text;
        document.getElementById('btnSaveCmt').innerText = "Cập nhật";
    }
};

window.deleteComment = async function(id) {
    if (confirm("Xóa bình luận này?")) {
        await fetch(`${API_URL}/comments/${id}`, { method: 'DELETE' });
        await loadDataFromServer();
        renderCommentsInModal();
    }
};

window.deletePost = async function(id) {
    if (confirm("Xóa bài viết này sẽ mất hết bình luận liên quan. Đồng ý?")) {
        await fetch(`${API_URL}/posts/${id}`, { method: 'DELETE' });
        await loadDataFromServer();
    }
};

function resetCmtForm() {
    document.getElementById('editCmtId').value = '';
    document.getElementById('cmtText').value = '';
    document.getElementById('btnSaveCmt').innerText = "Gửi";
}