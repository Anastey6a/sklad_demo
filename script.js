document.addEventListener("DOMContentLoaded", loadProducts);

// Додавання товару в список (збереження в LocalStorage)
function addProduct() {
    let product_number = document.getElementById("product_number").value;
    let name = document.getElementById("name").value;
    let quantity = document.getElementById("quantity").value;
    let serial_number = document.getElementById("serial_number").value;
    let arrival_date = document.getElementById("arrival_date").value;
    let price = document.getElementById("price").value;
    let storage_conditions = document.getElementById("storage_conditions").value;
    let reception_conditions = document.getElementById("reception_conditions").value;

    if (!product_number || !name || !quantity || !serial_number || !arrival_date || !price || !storage_conditions || !reception_conditions) {
        alert("Будь ласка, заповніть всі поля!");
        return;
    }

    let product = {
        product_number: product_number,
        name: name,
        quantity: quantity,
        serial_number: serial_number,
        arrival_date: arrival_date,
        price: price,
        total_price: quantity * price,
        storage_conditions: storage_conditions,
        reception_conditions: reception_conditions
    };

    let products = JSON.parse(localStorage.getItem("products")) || [];
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));

    loadProducts();
    clearInputFields(); // Очищення полів після додавання товару
}

// Завантаження товарів з LocalStorage в таблицю
function loadProducts() {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let tableBody = document.getElementById("product_list");
    tableBody.innerHTML = "";

    // Сортування за найменуванням (по алфавіту)
    products.sort((a, b) => a.name.localeCompare(b.name));

    products.forEach((product) => {
        let row = `<tr>
            <td>${product.product_number}</td>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.serial_number}</td>
            <td>${product.arrival_date}</td>
            <td>${product.price}</td>
            <td>${product.storage_conditions}</td>
            <td>${product.reception_conditions}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Очищення полів вводу після додавання товару
function clearInputFields() {
    document.getElementById("product_number").value = '';
    document.getElementById("name").value = '';
    document.getElementById("quantity").value = '';
    document.getElementById("serial_number").value = '';
    document.getElementById("arrival_date").value = '';
    document.getElementById("price").value = '';
    document.getElementById("storage_conditions").value = '';
    document.getElementById("reception_conditions").value = '';
}

// Експорт таблиці товарів в Excel
function exportToExcel() {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    let worksheet = XLSX.utils.json_to_sheet(products);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Товари");
    XLSX.writeFile(workbook, "products.xlsx");
}

// Запуск сканера штрих-кодів
function startScanner() {
    document.getElementById("scanner").style.display = "block";

    // Ініціалізація камери для відображення
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function(stream) {
                let videoElement = document.getElementById('scanner');
                videoElement.srcObject = stream;
                videoElement.play();
            })
            .catch(function(err) {
                console.log("Помилка доступу до камери: ", err);
                alert("Не вдалося отримати доступ до камери.");
            });
    }

    // Ініціалізація Quagga для сканування штрих-кодів
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#scanner")
        },
        decoder: {
            readers: ["ean_reader", "code_128_reader", "code_39_reader"]
        }
    }, function(err) {
        if (err) {
            console.error("Помилка при запуску Quagga: ", err);
            return;
        }
        Quagga.start();
    });

    // Обробник події після успішного зчитування штрих-коду
    Quagga.onDetected(function(result) {
        document.getElementById("product_number").value = result.codeResult.code;
        Quagga.stop();
        document.getElementById("scanner").style.display = "none";
    });
}

// Очищення всього списку товарів
function clearProductList() {
    if (confirm("Ви впевнені, що хочете очистити весь список товарів?")) {
        localStorage.removeItem("products");
        loadProducts();
    }
}
