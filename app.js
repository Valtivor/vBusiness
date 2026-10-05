/* =========================================
   vBUSINESS
   FIREBASE + APP LOGIC
========================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyDSQBT3iSFZVRIFzJM1bMQktEDzFb8wGGo",
    authDomain: "vbusiness-696b0.firebaseapp.com",
    projectId: "vbusiness-696b0",
    storageBucket: "vbusiness-696b0.firebasestorage.app",
    messagingSenderId: "263606664071",
    appId: "1:263606664071:web:9218974a9d084a05a37122"
};


const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const db = getFirestore(firebaseApp);


/* =========================================
   DEFAULT DATA
========================================= */

const defaultData = {

    business: {
        name: "My Business",
        currency: "₦"
    },

    sales: [],

    expenses: [],

    products: [],

    customers: [],

    receipts: []
};


/* =========================================
   LOCAL DATA
========================================= */

const LOCAL_KEY = "vBusinessLocalData";

let businessData = loadLocalData();


function loadLocalData() {

    try {

        const saved =
            localStorage.getItem(LOCAL_KEY);

        if (!saved) {

            return structuredClone(defaultData);

        }

        const parsed =
            JSON.parse(saved);

        return {

            ...structuredClone(defaultData),

            ...parsed,

            business: {
                ...defaultData.business,
                ...(parsed.business || {})
            },

            sales: parsed.sales || [],

            expenses: parsed.expenses || [],

            products: parsed.products || [],

            customers: parsed.customers || [],

            receipts: parsed.receipts || []

        };

    } catch (error) {

        console.error(
            "Could not load local data:",
            error
        );

        return structuredClone(defaultData);
    }
}


function saveLocalData() {

    localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify(businessData)
    );
}


/* =========================================
   FIRESTORE
========================================= */

async function saveCloudData() {

    const user = auth.currentUser;

    if (!user) return;

    try {

        await setDoc(
            doc(db, "users", user.uid),
            businessData,
            {
                merge: true
            }
        );

    } catch (error) {

        console.error(
            "Cloud save failed:",
            error
        );

        alert(
            "Your data could not be saved to the cloud."
        );
    }
}


async function loadCloudData() {

    const user = auth.currentUser;

    if (!user) return;

    try {

        const snapshot =
            await getDoc(
                doc(db, "users", user.uid)
            );

        if (snapshot.exists()) {

            const cloudData =
                snapshot.data();

            businessData = {

                ...structuredClone(defaultData),

                ...cloudData,

                business: {
                    ...defaultData.business,
                    ...(cloudData.business || {})
                },

                sales: cloudData.sales || [],

                expenses: cloudData.expenses || [],

                products: cloudData.products || [],

                customers: cloudData.customers || [],

                receipts: cloudData.receipts || []
            };

            saveLocalData();

        } else {

            await saveCloudData();
        }

    } catch (error) {

        console.error(
            "Cloud load failed:",
            error
        );
    }
}


/* =========================================
   DOM
========================================= */

const authScreen =
    document.getElementById("authScreen");

const appScreen =
    document.getElementById("app");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const showSignup =
    document.getElementById("showSignup");

const showLogin =
    document.getElementById("showLogin");

const loginError =
    document.getElementById("loginError");

const signupError =
    document.getElementById("signupError");

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const closeSidebar =
    document.getElementById("closeSidebar");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalContent =
    document.getElementById("modalContent");

const modalTitle =
    document.getElementById("modalTitle");

const closeModalButton =
    document.getElementById("closeModal");


/* =========================================
   AUTH SCREEN SWITCHING
========================================= */

showSignup.addEventListener(
    "click",
    function () {

        loginForm.classList.add("hidden");

        signupForm.classList.remove("hidden");

        loginError.textContent = "";
        signupError.textContent = "";
    }
);


showLogin.addEventListener(
    "click",
    function () {

        signupForm.classList.add("hidden");

        loginForm.classList.remove("hidden");

        loginError.textContent = "";
        signupError.textContent = "";
    }
);


/* =========================================
   SIGN UP
========================================= */

signupForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        signupError.textContent = "";

        const name =
            document.getElementById("signupName").value.trim();

        const businessName =
            document
                .getElementById("signupBusiness")
                .value
                .trim();

        const email =
            document
                .getElementById("signupEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("signupPassword")
                .value;


        const button =
            document.getElementById("signupButton");

        button.disabled = true;

        button.textContent =
            "Creating account...";


        try {

            const result =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            await updateProfile(
                result.user,
                {
                    displayName: name
                }
            );


            businessData =
                structuredClone(defaultData);


            businessData.business.name =
                businessName;


            saveLocalData();

            await saveCloudData();


        } catch (error) {

            console.error(error);

            signupError.textContent =
                getAuthErrorMessage(error);

        } finally {

            button.disabled = false;

            button.textContent =
                "Create Account";
        }
    }
);


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        loginError.textContent = "";

        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("loginPassword")
                .value;


        const button =
            document.getElementById("loginButton");

        button.disabled = true;

        button.textContent =
            "Signing in...";


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        } catch (error) {

            console.error(error);

            loginError.textContent =
                getAuthErrorMessage(error);

        } finally {

            button.disabled = false;

            button.textContent =
                "Sign In";
        }
    }
);


/* =========================================
   AUTH STATE
========================================= */

onAuthStateChanged(
    auth,
    async function (user) {

        if (user) {

            authScreen.style.display =
                "none";

            appScreen.style.display =
                "block";


            await loadCloudData();


            updateProfileInformation();

            updateEverything();

        } else {

            authScreen.style.display =
                "flex";

            appScreen.style.display =
                "none";
        }
    }
);


/* =========================================
   AUTH ERROR
========================================= */

function getAuthErrorMessage(error) {

    const code =
        error.code || "";

    if (
        code.includes(
            "auth/email-already-in-use"
        )
    ) {

        return "That email already has an account.";

    }

    if (
        code.includes(
            "auth/invalid-email"
        )
    ) {

        return "Please enter a valid email address.";

    }

    if (
        code.includes(
            "auth/weak-password"
        )
    ) {

        return "Password must be at least 6 characters.";

    }

    if (
        code.includes(
            "auth/invalid-credential"
        )
    ) {

        return "Incorrect email or password.";

    }

    if (
        code.includes(
            "auth/user-not-found"
        )
    ) {

        return "No account was found with that email.";

    }

    if (
        code.includes(
            "auth/wrong-password"
        )
    ) {

        return "Incorrect password.";

    }

    return error.message ||
        "Something went wrong. Please try again.";
}


/* =========================================
   NAVIGATION
========================================= */

const navItems =
    document.querySelectorAll(".nav-item");

navItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                const page =
                    item.dataset.page;

                showPage(page);

                sidebar.classList.remove(
                    "open"
                );
            }
        );
    }
);


function showPage(pageName) {

    document
        .querySelectorAll(".page")
        .forEach(
            function (page) {

                page.classList.remove(
                    "active-page"
                );
            }
        );


    const selectedPage =
        document.getElementById(
            pageName + "Page"
        );

    if (selectedPage) {

        selectedPage.classList.add(
            "active-page"
        );
    }


    navItems.forEach(
        function (item) {

            item.classList.toggle(
                "active",
                item.dataset.page === pageName
            );
        }
    );


    const titles = {

        dashboard: [
            "Dashboard",
            "Overview of your business"
        ],

        sales: [
            "Sales",
            "Track money coming into your business"
        ],

        expenses: [
            "Expenses",
            "Track your business spending"
        ],

        inventory: [
            "Inventory",
            "Manage products and stock levels"
        ],

        customers: [
            "Customers",
            "Manage your customers"
        ],

        receipts: [
            "Receipts",
            "View and print your receipts"
        ],

        settings: [
            "Settings",
            "Manage your account"
        ]
    };


    const information =
        titles[pageName] ||
        titles.dashboard;


    document.getElementById(
        "pageTitle"
    ).textContent = information[0];


    document.getElementById(
        "pageSubtitle"
    ).textContent = information[1];
}


/* =========================================
   MOBILE SIDEBAR
========================================= */

menuButton.addEventListener(
    "click",
    function () {

        sidebar.classList.add("open");
    }
);


closeSidebar.addEventListener(
    "click",
    function () {

        sidebar.classList.remove("open");
    }
);


/* =========================================
   MODAL
========================================= */

function openModal(title, content) {

    modalTitle.textContent = title;

    modalContent.innerHTML = content;

    modalOverlay.classList.remove("hidden");
}


function closeModal() {

    modalOverlay.classList.add("hidden");

    modalContent.innerHTML = "";
}


closeModalButton.addEventListener(
    "click",
    closeModal
);


modalOverlay.addEventListener(
    "click",
    function (event) {

        if (
            event.target === modalOverlay
        ) {

            closeModal();
        }
    }
);


/* =========================================
   MONEY
========================================= */

function money(value) {

    const currency =
        businessData.business.currency || "₦";

    const number =
        Number(value) || 0;

    return (
        currency +
        number.toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        )
    );
}


/* =========================================
   DATE
========================================= */

function getToday() {

    const date =
        new Date();

    return date.toISOString()
        .split("T")[0];
}


function formatDate(dateValue) {

    if (!dateValue) return "-";

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================
   ID
========================================= */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


/* =========================================
   SAVE EVERYTHING
========================================= */

async function saveEverything() {

    saveLocalData();

    await saveCloudData();

    updateEverything();
}


/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {

    const today =
        getToday();


    const todaySales =
        businessData.sales
            .filter(
                sale =>
                    sale.date &&
                    sale.date.startsWith(today)
            )
            .reduce(
                (total, sale) =>
                    total +
                    Number(sale.total || 0),
                0
            );


    const todayExpenses =
        businessData.expenses
            .filter(
                expense =>
                    expense.date &&
                    expense.date.startsWith(today)
            )
            .reduce(
                (total, expense) =>
                    total +
                    Number(expense.amount || 0),
                0
            );


    const todayProfit =
        todaySales -
        todayExpenses;


    document.getElementById(
        "todaySales"
    ).textContent = money(todaySales);


    document.getElementById(
        "todayExpenses"
    ).textContent = money(todayExpenses);


    document.getElementById(
        "todayProfit"
    ).textContent = money(todayProfit);


    document.getElementById(
        "productCount"
    ).textContent =
        businessData.products.length;


    document.getElementById(
        "businessName"
    ).textContent =
        businessData.business.name;


    renderRecentActivity();
}


/* =========================================
   RECENT ACTIVITY
========================================= */

function renderRecentActivity() {

    const container =
        document.getElementById(
            "recentActivity"
        );


    const activities = [];


    businessData.sales.forEach(
        sale => {

            activities.push({

                type: "sale",

                title: "Sale recorded",

                detail:
                    sale.productName ||
                    "Business sale",

                amount:
                    Number(sale.total || 0),

                date:
                    sale.date
            });
        }
    );


    businessData.expenses.forEach(
        expense => {

            activities.push({

                type: "expense",

                title: "Expense recorded",

                detail:
                    expense.description ||
                    "Business expense",

                amount:
                    Number(expense.amount || 0),

                date:
                    expense.date
            });
        }
    );


    activities.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    const recent =
        activities.slice(0, 7);


    if (!recent.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">◌</div>
                <p>No activity yet.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        recent.map(
            activity => {

                const isSale =
                    activity.type === "sale";


                return `
                    <div class="activity-item">

                        <div class="activity-left">

                            <div class="activity-icon">
                                ${isSale ? "↗" : "↘"}
                            </div>

                            <div>
                                <strong>
                                    ${escapeHtml(activity.title)}
                                </strong>

                                <span>
                                    ${escapeHtml(activity.detail)}
                                    ·
                                    ${formatDate(activity.date)}
                                </span>
                            </div>

                        </div>

                        <div class="activity-amount">
                            ${isSale ? "+" : "-"}
                            ${money(activity.amount)}
                        </div>

                    </div>
                `;
            }
        )
        .join("");
}


/* =========================================
   INVENTORY
========================================= */

function updateInventory() {

    const products =
        businessData.products;


    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (total, product) =>
                total +
                Number(product.stock || 0),
            0
        );


    const lowStockProducts =
        products.filter(
            product =>
                Number(product.stock || 0) <=
                Number(product.lowStock || 5)
        );


    const stockValue =
        products.reduce(
            (total, product) =>
                total +
                (
                    Number(product.costPrice || 0) *
                    Number(product.stock || 0)
                ),
            0
        );


    document.getElementById(
        "inventoryTotalProducts"
    ).textContent = totalProducts;


    document.getElementById(
        "inventoryTotalStock"
    ).textContent = totalStock;


    document.getElementById(
        "inventoryLowStock"
    ).textContent =
        lowStockProducts.length;


    document.getElementById(
        "inventoryStockValue"
    ).textContent =
        money(stockValue);


    updateCategoryFilter();

    updateLowStockAlert();

    renderProducts();
}


/* =========================================
   CATEGORY FILTER
========================================= */

function updateCategoryFilter() {

    const select =
        document.getElementById(
            "inventoryCategoryFilter"
        );


    const currentValue =
        select.value;


    const categories =
        [
            ...new Set(
                businessData.products
                    .map(
                        product =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    select.innerHTML =
        `<option value="all">
            All Categories
        </option>`;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            select.appendChild(option);
        }
    );


    if (
        categories.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;

    } else {

        select.value =
            "all";
    }
}


/* =========================================
   SEARCH
========================================= */

const inventorySearch =
    document.getElementById(
        "inventorySearch"
    );


const inventoryCategoryFilter =
    document.getElementById(
        "inventoryCategoryFilter"
    );


inventorySearch.addEventListener(
    "input",
    renderProducts
);


inventoryCategoryFilter.addEventListener(
    "change",
    renderProducts
);


/* =========================================
   LOW STOCK ALERT
========================================= */

function updateLowStockAlert() {

    const alert =
        document.getElementById(
            "lowStockAlert"
        );

    const text =
        document.getElementById(
            "lowStockAlertText"
        );


    const lowProducts =
        businessData.products.filter(
            product =>
                Number(product.stock || 0) <=
                Number(product.lowStock || 5)
        );


    if (!lowProducts.length) {

        alert.classList.add(
            "hidden"
        );

        return;
    }


    alert.classList.remove(
        "hidden"
    );


    const names =
        lowProducts
            .slice(0, 3)
            .map(
                product =>
                    product.name
            )
            .join(", ");


    if (lowProducts.length > 3) {

        text.textContent =
            `${names} and ${
                lowProducts.length - 3
            } more product(s) are low on stock.`;

    } else {

        text.textContent =
            `${names} ${
                lowProducts.length === 1
                    ? "is"
                    : "are"
            } running low.`;
    }
}


/* =========================================
   RENDER PRODUCTS
========================================= */

function renderProducts() {

    const container =
        document.getElementById(
            "productsList"
        );


    const search =
        inventorySearch.value
            .trim()
            .toLowerCase();


    const category =
        inventoryCategoryFilter.value;


    const filtered =
        businessData.products.filter(
            product => {

                const matchesSearch =
                    !search ||
                    product.name
                        .toLowerCase()
                        .includes(search) ||
                    (
                        product.category || ""
                    )
                    .toLowerCase()
                    .includes(search);


                const matchesCategory =
                    category === "all" ||
                    product.category === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );


    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">▣</div>
                <p>No products found.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered.map(
            product => {

                const stock =
                    Number(product.stock || 0);

                const lowStock =
                    Number(
                        product.lowStock || 5
                    );

                const isLow =
                    stock <= lowStock;

                const isOut =
                    stock <= 0;

                const profit =
                    Number(product.sellPrice || 0) -
                    Number(product.costPrice || 0);


                return `
                    <div class="product-card ${
                        isLow
                            ? "low-stock"
                            : ""
                    }">

                        <div class="product-top">

                            <div class="product-icon">
                                ▣
                            </div>

                            <div class="product-actions">

                                <button
                                    class="icon-button"
                                    onclick="editProduct('${product.id}')"
                                    title="Edit product"
                                >
                                    ✎
                                </button>

                                <button
                                    class="icon-button delete"
                                    onclick="deleteProduct('${product.id}')"
                                    title="Delete product"
                                >
                                    ×
                                </button>

                            </div>

                        </div>


                        <h3>
                            ${escapeHtml(product.name)}
                        </h3>

                        <div class="product-category">
                            ${escapeHtml(
                                product.category ||
                                "Uncategorized"
                            )}
                        </div>


                        <div class="product-prices">

                            <div class="price-box">

                                <span>
                                    Selling Price
                                </span>

                                <strong>
                                    ${money(product.sellPrice)}
                                </strong>

                            </div>


                            <div class="price-box">

                                <span>
                                    Cost Price
                                </span>

                                <strong>
                                    ${money(product.costPrice)}
                                </strong>

                            </div>

                        </div>


                        <div class="product-stock">

                            <span class="stock-label">
                                Stock
                            </span>

                            <span class="
                                stock-number
                                ${isOut ? "out" : ""}
                                ${isLow && !isOut ? "low" : ""}
                            ">
                                ${
                                    isOut
                                        ? "Out of stock"
                                        : stock + " units"
                                }
                            </span>

                        </div>


                        <div class="profit-label">
                            Profit per unit:
                            ${money(profit)}
                        </div>

                    </div>
                `;
            }
        )
        .join("");
}


/* =========================================
   ADD PRODUCT BUTTONS
========================================= */

document.getElementById(
    "addProductButton"
).addEventListener(
    "click",
    openAddProductModal
);


document.getElementById(
    "inventoryAddButton"
).addEventListener(
    "click",
    openAddProductModal
);


/* =========================================
   ADD PRODUCT MODAL
========================================= */

function openAddProductModal() {

    openModal(
        "Add Product",
        `
            <form id="productForm" class="modal-form">

                <label>
                    Product Name

                    <input
                        type="text"
                        id="productName"
                        placeholder="e.g. Coca-Cola"
                        required
                    >
                </label>


                <label>
                    Category

                    <input
                        type="text"
                        id="productCategory"
                        placeholder="e.g. Drinks"
                    >
                </label>


                <div class="form-grid">

                    <label>
                        Cost Price

                        <input
                            type="number"
                            id="productCostPrice"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                        >
                    </label>


                    <label>
                        Selling Price

                        <input
                            type="number"
                            id="productSellPrice"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                        >
                    </label>

                </div>


                <div class="form-grid">

                    <label>
                        Stock Quantity

                        <input
                            type="number"
                            id="productStock"
                            placeholder="0"
                            min="0"
                            required
                        >
                    </label>


                    <label>
                        Low Stock Level

                        <input
                            type="number"
                            id="productLowStock"
                            value="5"
                            min="0"
                            required
                        >
                    </label>

                </div>


                <div class="modal-actions">

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="closeModal()"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-button"
                    >
                        Add Product
                    </button>

                </div>

            </form>
        `
    );


    document.getElementById(
        "productForm"
    ).addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const product = {

                id: createId(),

                name:
                    document
                        .getElementById("productName")
                        .value
                        .trim(),

                category:
                    document
                        .getElementById("productCategory")
                        .value
                        .trim() ||
                    "Uncategorized",

                costPrice:
                    Number(
                        document
                            .getElementById(
                                "productCostPrice"
                            )
                            .value
                    ),

                sellPrice:
                    Number(
                        document
                            .getElementById(
                                "productSellPrice"
                            )
                            .value
                    ),

                stock:
                    Number(
                        document
                            .getElementById(
                                "productStock"
                            )
                            .value
                    ),

                lowStock:
                    Number(
                        document
                            .getElementById(
                                "productLowStock"
                            )
                            .value
                    ),

                createdAt:
                    new Date().toISOString()
            };


            businessData.products.push(
                product
            );


            closeModal();

            await saveEverything();
        }
    );
}


/* =========================================
   EDIT PRODUCT
========================================= */

window.editProduct =
    function (productId) {

        const product =
            businessData.products.find(
                item =>
                    item.id === productId
            );


        if (!product) return;


        openModal(
            "Edit Product",
            `
                <form id="editProductForm" class="modal-form">

                    <label>
                        Product Name

                        <input
                            type="text"
                            id="editProductName"
                            value="${escapeAttribute(product.name)}"
                            required
                        >
                    </label>


                    <label>
                        Category

                        <input
                            type="text"
                            id="editProductCategory"
                            value="${escapeAttribute(product.category || "")}"
                        >
                    </label>


                    <div class="form-grid">

                        <label>
                            Cost Price

                            <input
                                type="number"
                                id="editProductCost"
                                value="${Number(product.costPrice || 0)}"
                                min="0"
                                step="0.01"
                                required
                            >
                        </label>


                        <label>
                            Selling Price

                            <input
                                type="number"
                                id="editProductSell"
                                value="${Number(product.sellPrice || 0)}"
                                min="0"
                                step="0.01"
                                required
                            >
                        </label>

                    </div>


                    <div class="form-grid">

                        <label>
                            Stock Quantity

                            <input
                                type="number"
                                id="editProductStock"
                                value="${Number(product.stock || 0)}"
                                min="0"
                                required
                            >
                        </label>


                        <label>
                            Low Stock Level

                            <input
                                type="number"
                                id="editProductLow"
                                value="${Number(product.lowStock || 5)}"
                                min="0"
                                required
                            >
                        </label>

                    </div>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            onclick="closeModal()"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="primary-button"
                        >
                            Save Changes
                        </button>

                    </div>

                </form>
            `
        );


        document.getElementById(
            "editProductForm"
        ).addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                product.name =
                    document
                        .getElementById(
                            "editProductName"
                        )
                        .value
                        .trim();


                product.category =
                    document
                        .getElementById(
                            "editProductCategory"
                        )
                        .value
                        .trim() ||
                    "Uncategorized";


                product.costPrice =
                    Number(
                        document
                            .getElementById(
                                "editProductCost"
                            )
                            .value
                    );


                product.sellPrice =
                    Number(
                        document
                            .getElementById(
                                "editProductSell"
                            )
                            .value
                    );


                product.stock =
                    Number(
                        document
                            .getElementById(
                                "editProductStock"
                            )
                            .value
                    );


                product.lowStock =
                    Number(
                        document
                            .getElementById(
                                "editProductLow"
                            )
                            .value
                    );


                closeModal();

                await saveEverything();
            }
        );
    };


/* =========================================
   DELETE PRODUCT
========================================= */

window.deleteProduct =
    async function (productId) {

        const product =
            businessData.products.find(
                item =>
                    item.id === productId
            );


        if (!product) return;


        const confirmed =
            confirm(
                `Delete "${product.name}" from inventory?`
            );


        if (!confirmed) return;


        businessData.products =
            businessData.products.filter(
                item =>
                    item.id !== productId
            );


        await saveEverything();
    };


/* =========================================
   SALES
========================================= */

document.getElementById(
    "addSaleButton"
).addEventListener(
    "click",
    openAddSaleModal
);


document.getElementById(
    "salesAddButton"
).addEventListener(
    "click",
    openAddSaleModal
);


function openAddSaleModal() {

    if (!businessData.products.length) {

        alert(
            "Add a product to your inventory first."
        );

        showPage("inventory");

        return;
    }


    const productOptions =
        businessData.products
            .map(
                product =>
                    `
                    <option
                        value="${product.id}"
                    >
                        ${escapeHtml(product.name)}
                        — Stock: ${product.stock}
                    </option>
                    `
            )
            .join("");


    openModal(
        "Add Sale",
        `
            <form id="saleForm" class="modal-form">

                <label>
                    Product

                    <select
                        id="saleProduct"
                        required
                    >

                        <option value="">
                            Select product
                        </option>

                        ${productOptions}

                    </select>

                </label>


                <div class="form-grid">

                    <label>
                        Quantity

                        <input
                            type="number"
                            id="saleQuantity"
                            value="1"
                            min="1"
                            required
                        >
                    </label>


                    <label>
                        Customer

                        <input
                            type="text"
                            id="saleCustomer"
                            placeholder="Optional"
                        >
                    </label>

                </div>


                <label>
                    Payment Method

                    <select id="salePayment">

                        <option value="Cash">
                            Cash
                        </option>

                        <option value="Transfer">
                            Transfer
                        </option>

                        <option value="Card">
                            Card
                        </option>

                    </select>

                </label>


                <div
                    id="salePreview"
                    class="price-box"
                >
                    Select a product.
                </div>


                <div class="modal-actions">

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="closeModal()"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-button"
                    >
                        Record Sale
                    </button>

                </div>

            </form>
        `
    );


    const productSelect =
        document.getElementById(
            "saleProduct"
        );

    const quantityInput =
        document.getElementById(
            "saleQuantity"
        );

    const preview =
        document.getElementById(
            "salePreview"
        );


    function updateSalePreview() {

        const product =
            businessData.products.find(
                item =>
                    item.id ===
                    productSelect.value
            );


        if (!product) {

            preview.textContent =
                "Select a product.";

            return;
        }


        const quantity =
            Number(
                quantityInput.value
            ) || 0;


        const total =
            quantity *
            Number(product.sellPrice || 0);


        preview.innerHTML = `
            <span>Total</span>
            <strong>
                ${money(total)}
            </strong>
        `;
    }


    productSelect.addEventListener(
        "change",
        updateSalePreview
    );


    quantityInput.addEventListener(
        "input",
        updateSalePreview
    );


    document.getElementById(
        "saleForm"
    ).addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const product =
                businessData.products.find(
                    item =>
                        item.id ===
                        productSelect.value
                );


            if (!product) {

                alert(
                    "Please select a product."
                );

                return;
            }


            const quantity =
                Number(
                    quantityInput.value
                );


            if (quantity <= 0) {

                alert(
                    "Quantity must be greater than zero."
                );

                return;
            }


            if (
                quantity >
                Number(product.stock)
            ) {

                alert(
                    `Only ${product.stock} unit(s) of ${product.name} are available.`
                );

                return;
            }


            const total =
                quantity *
                Number(product.sellPrice || 0);


            const sale = {

                id: createId(),

                productId:
                    product.id,

                productName:
                    product.name,

                quantity:

                    quantity,

                unitPrice:
                    Number(
                        product.sellPrice
                    ),

                total:

                    total,

                customer:
                    document
                        .getElementById(
                            "saleCustomer"
                        )
                        .value
                        .trim(),

                paymentMethod:
                    document
                        .getElementById(
                            "salePayment"
                        )
                        .value,

                date:
                    new Date().toISOString()
            };


            product.stock -= quantity;


            businessData.sales.push(
                sale
            );


            businessData.receipts.push({

                id:
                    createId(),

                saleId:
                    sale.id,

                date:
                    sale.date,

                productName:
                    sale.productName,

                quantity:
                    sale.quantity,

                total:
                    sale.total,

                customer:
                    sale.customer,

                paymentMethod:
                    sale.paymentMethod
            });


            closeModal();

            await saveEverything();

            showPage("sales");
        }
    );
}


/* =========================================
   SALES LIST
========================================= */

function renderSales() {

    const container =
        document.getElementById(
            "salesList"
        );


    const sales =
        [...businessData.sales]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );


    if (!sales.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">↗</div>
                <p>No sales recorded yet.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        sales.map(
            sale => {

                return `
                    <div class="data-row">

                        <div class="data-main">

                            <strong>
                                ${escapeHtml(
                                    sale.productName
                                )}
                            </strong>

                            <span>
                                ${sale.quantity}
                                unit(s)
                                ·
                                ${escapeHtml(
                                    sale.paymentMethod
                                )}
                                ·
                                ${formatDate(
                                    sale.date
                                )}
                            </span>

                        </div>

                        <div class="data-side">

                            <strong>
                                +${money(sale.total)}
                            </strong>

                            <span>
                                ${sale.customer
                                    ? escapeHtml(
                                        sale.customer
                                    )
                                    : "Walk-in customer"}
                            </span>

                        </div>

                    </div>
                `;
            }
        )
        .join("");
}


/* =========================================
   EXPENSES
========================================= */

document.getElementById(
    "addExpenseButton"
).addEventListener(
    "click",
    openAddExpenseModal
);


document.getElementById(
    "expensesAddButton"
).addEventListener(
    "click",
    openAddExpenseModal
);


function openAddExpenseModal() {

    openModal(
        "Add Expense",
        `
            <form id="expenseForm" class="modal-form">

                <label>
                    Description

                    <input
                        type="text"
                        id="expenseDescription"
                        placeholder="e.g. Transport"
                        required
                    >
                </label>


                <label>
                    Amount

                    <input
                        type="number"
                        id="expenseAmount"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                    >
                </label>


                <label>
                    Category

                    <select id="expenseCategory">

                        <option>
                            General
                        </option>

                        <option>
                            Transport
                        </option>

                        <option>
                            Rent
                        </option>

                        <option>
                            Electricity
                        </option>

                        <option>
                            Stock
                        </option>

                        <option>
                            Salary
                        </option>

                        <option>
                            Other
                        </option>

                    </select>

                </label>


                <div class="modal-actions">

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="closeModal()"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-button"
                    >
                        Add Expense
                    </button>

                </div>

            </form>
        `
    );


    document.getElementById(
        "expenseForm"
    ).addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            businessData.expenses.push({

                id:
                    createId(),

                description:
                    document
                        .getElementById(
                            "expenseDescription"
                        )
                        .value
                        .trim(),

                amount:
                    Number(
                        document
                            .getElementById(
                                "expenseAmount"
                            )
                            .value
                    ),

                category:
                    document
                        .getElementById(
                            "expenseCategory"
                        )
                        .value,

                date:
                    new Date().toISOString()
            });


            closeModal();

            await saveEverything();

            showPage("expenses");
        }
    );
}


/* =========================================
   EXPENSE LIST
========================================= */

function renderExpenses() {

    const container =
        document.getElementById(
            "expensesList"
        );


    const expenses =
        [...businessData.expenses]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );


    if (!expenses.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">↘</div>
                <p>No expenses recorded yet.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        expenses.map(
            expense => {

                return `
                    <div class="data-row">

                        <div class="data-main">

                            <strong>
                                ${escapeHtml(
                                    expense.description
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    expense.category
                                )}
                                ·
                                ${formatDate(
                                    expense.date
                                )}
                            </span>

                        </div>

                        <div class="data-side">

                            <strong>
                                -${money(
                                    expense.amount
                                )}
                            </strong>

                        </div>

                    </div>
                `;
            }
        )
        .join("");
}


/* =========================================
   CUSTOMERS
========================================= */

document.getElementById(
    "customerAddButton"
).addEventListener(
    "click",
    openAddCustomerModal
);


function openAddCustomerModal() {

    openModal(
        "Add Customer",
        `
            <form id="customerForm" class="modal-form">

                <label>
                    Customer Name

                    <input
                        type="text"
                        id="customerName"
                        placeholder="Customer name"
                        required
                    >
                </label>


                <label>
                    Phone

                    <input
                        type="tel"
                        id="customerPhone"
                        placeholder="080..."
                    >
                </label>


                <label>
                    Email

                    <input
                        type="email"
                        id="customerEmail"
                        placeholder="Optional"
                    >
                </label>


                <div class="modal-actions">

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="closeModal()"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-button"
                    >
                        Add Customer
                    </button>

                </div>

            </form>
        `
    );


    document.getElementById(
        "customerForm"
    ).addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            businessData.customers.push({

                id:
                    createId(),

                name:
                    document
                        .getElementById(
                            "customerName"
                        )
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById(
                            "customerPhone"
                        )
                        .value
                        .trim(),

                email:
                    document
                        .getElementById(
                            "customerEmail"
                        )
                        .value
                        .trim(),

                createdAt:
                    new Date().toISOString()
            });


            closeModal();

            await saveEverything();

            showPage("customers");
        }
    );
}


/* =========================================
   CUSTOMER LIST
========================================= */

function renderCustomers() {

    const container =
        document.getElementById(
            "customersList"
        );


    if (!businessData.customers.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">♙</div>
                <p>No customers added yet.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        businessData.customers.map(
            customer => {

                const purchases =
                    businessData.sales.filter(
                        sale =>
                            sale.customer
                                ?.toLowerCase() ===
                            customer.name
                                .toLowerCase()
                    );


                const totalSpent =
                    purchases.reduce(
                        (total, sale) =>
                            total +
                            Number(
                                sale.total || 0
                            ),
                        0
                    );


                return `
                    <div class="data-row">

                        <div class="data-main">

                            <strong>
                                ${escapeHtml(
                                    customer.name
                                )}
                            </strong>

                            <span>
                                ${
                                    escapeHtml(
                                        customer.phone ||
                                        customer.email ||
                                        "No contact information"
                                    )
                                }
                            </span>

                        </div>

                        <div class="data-side">

                            <strong>
                                ${money(totalSpent)}
                            </strong>

                            <span>
                                ${purchases.length}
                                purchase(s)
                            </span>

                        </div>

                    </div>
                `;
            }
        )
        .join("");
}


/* =========================================
   RECEIPTS
========================================= */

function renderReceipts() {

    const container =
        document.getElementById(
            "receiptsList"
        );


    const receipts =
        [...businessData.receipts]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );


    if (!receipts.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">▤</div>
                <p>No receipts available yet.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        receipts.map(
            receipt => {

                return `
                    <div class="data-row">

                        <div class="data-main">

                            <strong>
                                ${escapeHtml(
                                    receipt.productName
                                )}
                            </strong>

                            <span>
                                Receipt
                                ·
                                ${formatDate(
                                    receipt.date
                                )}
                                ·
                                ${receipt.paymentMethod}
                            </span>

                        </div>

                        <div class="data-side">

                            <strong>
                                ${money(
                                    receipt.total
                                )}
                            </strong>

                            <button
                                class="secondary-button"
                                onclick="viewReceipt('${receipt.id}')"
                            >
                                View
                            </button>

                        </div>

                    </div>
                `;
            }
        )
        .join("");
}


/* =========================================
   VIEW RECEIPT
========================================= */

window.viewReceipt =
    function (receiptId) {

        const receipt =
            businessData.receipts.find(
                item =>
                    item.id === receiptId
            );


        if (!receipt) return;


        openModal(
            "Receipt",
            `
                <div class="receipt">

                    <div class="receipt-header">

                        <h2>
                            ${escapeHtml(
                                businessData.business.name
                            )}
                        </h2>

                        <p>
                            Receipt
                        </p>

                        <p>
                            ${formatDate(
                                receipt.date
                            )}
                        </p>

                    </div>


                    <div class="receipt-items">

                        <div class="receipt-item">

                            <span>
                                ${escapeHtml(
                                    receipt.productName
                                )}
                                ×
                                ${receipt.quantity}
                            </span>

                            <strong>
                                ${money(
                                    receipt.total
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="receipt-total">

                        <span>
                            Total
                        </span>

                        <span>
                            ${money(
                                receipt.total
                            )}
                        </span>

                    </div>


                    <div style="
                        margin-top:18px;
                        color:#718096;
                        font-size:12px;
                    ">

                        Payment:
                        ${escapeHtml(
                            receipt.paymentMethod
                        )}

                        ${
                            receipt.customer
                                ? `<br>Customer:
                                    ${escapeHtml(
                                        receipt.customer
                                    )}`
                                : ""
                        }

                    </div>


                    <button
                        class="primary-button"
                        style="width:100%;margin-top:20px;"
                        onclick="printReceipt('${receipt.id}')"
                    >
                        Print Receipt
                    </button>

                </div>
            `
        );
    };


/* =========================================
   PRINT RECEIPT
========================================= */

window.printReceipt =
    function (receiptId) {

        const receipt =
            businessData.receipts.find(
                item =>
                    item.id === receiptId
            );


        if (!receipt) return;


        const printArea =
            document.getElementById(
                "printReceipt"
            );


        printArea.innerHTML = `

            <div style="
                max-width:500px;
                margin:0 auto;
                padding:30px;
                font-family:Arial,sans-serif;
            ">

                <div style="
                    text-align:center;
                    border-bottom:1px dashed #999;
                    padding-bottom:15px;
                ">

                    <h2>
                        ${escapeHtml(
                            businessData.business.name
                        )}
                    </h2>

                    <p>
                        Receipt
                    </p>

                    <p>
                        ${formatDate(
                            receipt.date
                        )}
                    </p>

                </div>


                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:15px 0;
                    border-bottom:1px solid #ddd;
                ">

                    <span>
                        ${escapeHtml(
                            receipt.productName
                        )}
                        ×
                        ${receipt.quantity}
                    </span>

                    <strong>
                        ${money(
                            receipt.total
                        )}
                    </strong>

                </div>


                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding-top:20px;
                    font-size:18px;
                    font-weight:bold;
                ">

                    <span>
                        TOTAL
                    </span>

                    <span>
                        ${money(
                            receipt.total
                        )}
                    </span>

                </div>


                <p style="
                    margin-top:20px;
                    font-size:12px;
                    color:#555;
                ">
                    Payment:
                    ${escapeHtml(
                        receipt.paymentMethod
                    )}
                </p>

            </div>
        `;


        window.print();
    };


/* =========================================
   SETTINGS
========================================= */

document.getElementById(
    "saveSettingsButton"
).addEventListener(
    "click",
    async function () {

        businessData.business.name =
            document
                .getElementById(
                    "businessNameInput"
                )
                .value
                .trim() ||
            "My Business";


        businessData.business.currency =
            document
                .getElementById(
                    "currencyInput"
                )
                .value
                .trim() ||
            "₦";


        await saveEverything();


        alert(
            "Business settings saved."
        );
    }
);


/* =========================================
   CLEAR LOCAL DATA
========================================= */

document.getElementById(
    "clearDataButton"
).addEventListener(
    "click",
    function () {

        const confirmed =
            confirm(
                "Clear local data from this browser? Your cloud data will not be deleted."
            );


        if (!confirmed) return;


        localStorage.removeItem(
            LOCAL_KEY
        );


        alert(
            "Local data cleared."
        );

        location.reload();
    }
);


/* =========================================
   LOGOUT
========================================= */

document.getElementById(
    "logoutButton"
).addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(error);

            alert(
                "Could not sign out."
            );
        }
    }
);


/* =========================================
   PROFILE
========================================= */

function updateProfileInformation() {

    const user =
        auth.currentUser;


    if (!user) return;


    const name =
        user.displayName ||
        "User";


    const email =
        user.email ||
        "";


    document.getElementById(
        "profileName"
    ).textContent = name;


    document.getElementById(
        "profileEmail"
    ).textContent = email;


    document.getElementById(
        "accountEmail"
    ).textContent = email;


    const firstLetter =
        name
            .charAt(0)
            .toUpperCase() ||
        "V";


    document.getElementById(
        "profileAvatar"
    ).textContent =
        firstLetter;


    document.getElementById(
        "topProfileAvatar"
    ).textContent =
        firstLetter;


    document.getElementById(
        "businessNameInput"
    ).value =
        businessData.business.name;


    document.getElementById(
        "currencyInput"
    ).value =
        businessData.business.currency;
}


document.getElementById(
    "profileButton"
).addEventListener(
    "click",
    function () {

        showPage("settings");
    }
);


/* =========================================
   UPDATE EVERYTHING
========================================= */

function updateEverything() {

    updateDashboard();

    updateInventory();

    renderSales();

    renderExpenses();

    renderCustomers();

    renderReceipts();

    updateProfileInformation();
}


/* =========================================
   SECURITY HELPERS
========================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}


/* =========================================
   START
========================================= */

showPage("dashboard");

console.log(
    "vBusiness is running."
);