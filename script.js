let allProducts = []; // Lưu trữ dữ liệu gốc
const DB_URL = 'db.json';

// 1. Tải dữ liệu ban đầu
async function fetchProducts() {
    try {
        const response = await fetch(DB_URL);
        allProducts = await response.json();
        renderTable(allProducts);
    } catch (error) {
        console.error("Lỗi fetch:", error);
    }
}

// 2. Hàm hiển thị bảng (Render)
function renderTable(data) {
    const tbody = document.getElementById('product-table-body');
    const noResult = document.getElementById('noResult');
    tbody.innerHTML = '';

    if (data.length === 0) {
        noResult.classList.remove('d-none');
    } else {
        noResult.classList.add('d-none');
        data.forEach(product => {
            // Xử lý link ảnh (ưu tiên DB -> Imgur fallback)
            let imgUrl = product.images && product.images[0] ? product.images[0].replace(/[\[\]\"]/g, "") : "";
            
            if (!imgUrl || imgUrl.includes("placehold.co") || imgUrl.includes("placeimg.com")) {
                imgUrl = `https://loremflickr.com/100/100/${encodeURIComponent(product.category.name)}?lock=${product.id}`;
            }

            tbody.innerHTML += `
                <tr>
                    <td><small class="text-muted">#${product.id}</small></td>
                    <td>
                        <img src="${imgUrl}" class="product-img-td" referrerpolicy="no-referrer" 
                             onerror="this.src='https://i.imgur.com/ZANVnHE.jpeg'">
                    </td>
                    <td><span class="fw-bold text-dark">${product.title}</span></td>
                    <td><span class="badge bg-info-subtle text-info border border-info-subtle px-2">${product.category.name}</span></td>
                    <td><span class="fw-bold text-danger">$${product.price}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    }
}

// 3. Hàm tìm kiếm theo tên (sử dụng oninput thay cho onChange để mượt hơn)
function onSearchChange() {
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtered = allProducts.filter(p => p.title.toLowerCase().includes(keyword));
    renderTable(filtered);
}

// 4. Hàm sắp xếp Tên và Giá
function handleSort(key, direction) {
    const sortedData = [...allProducts].sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        // Nếu là tên, chuyển về chữ thường để so sánh
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (direction === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
    });
    renderTable(sortedData);
}

// Khởi chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', fetchProducts);