// ============================================================
// vBUSINESS - app.js
// Firebase + Authentication + Firestore
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

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


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyDSQBT3iSFZVRIFzJM1bMQktEDzFb8wGGo",
    authDomain: "vbusiness-696b0.firebaseapp.com",
    projectId: "vbusiness-696b0",
    storageBucket: "vbusiness-696b0.firebasestorage.app",
    messagingSenderId: "263606664071",
    appId: "1:263606664071:web:9218974a9d084a05a37122"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


// ============================================================
// DEFAULT DATA
// ============================================================

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


// ============================================================
// LOCAL STORAGE
// ============================================================

const LOCAL_KEY = "vBusinessLocalData";

let businessData = loadLocalData();


function loadLocalData() {

    try {

        const saved = localStorage.getItem(LOCAL_KEY);

        if (!saved) {
            return structuredClone(defaultData);
        }

        const parsed = JSON.parse(saved);

        return {
            ...structuredClone(defaultData),
            ...parsed
        };

    } catch (error) {

        console.error("Could not load local data:", error);

        return structuredClone(defaultData);
    }
}


function saveLocalData() {

    localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify(businessData)
    );
}


// ============================================================
// FIRESTORE
// ============================================================

async function saveCloudData() {

    if (!auth.currentUser) {
        saveLocalData();
        return;
    }

    try {

        const userRef = doc(
            db,
            "users",
            auth.currentUser.uid
        );

        await setDoc(
            userRef,
            {
                business: businessData.business,
                sales: businessData.sales,
                expenses: businessData.expenses,
                products: businessData.products,
                customers: businessData.customers,
                receipts: businessData.receipts,
                updatedAt: new Date().toISOString()
            },
            {
                merge: true
            }
        );

        saveLocalData();

        console.log("Cloud data saved.");

    } catch (error) {

        console.error("Cloud save failed:", error);

        saveLocalData();
    }
}


async function loadCloudData() {

    if (!auth.currentUser) {
        return;
    }

    try {

        const userRef = doc(
            db,
            "users",
            auth.currentUser.uid
        );

        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {

            const cloudData = snapshot.data();

            businessData = {
                ...structuredClone(defaultData),
                ...cloudData
            };

            businessData.business = {
                ...defaultData.business,
                ...(cloudData.business || {})
            };

            businessData.sales = cloudData.sales || [];
            businessData.expenses = cloudData.expenses || [];
            businessData.products = cloudData.products || [];
            businessData.customers = cloudData.customers || [];
            businessData.receipts = cloudData.receipts || [];

        } else {

            await saveCloudData();
        }

        saveLocalData();

        updateEverything();

    } catch (error) {

        console.error("Could not load cloud data:", error);

        businessData = loadLocalData();

        updateEverything();
    }
}


// ============================================================
// ELEMENTS
// ============================================================

const authScreen = document.getElementById("authScreen");
const appScreen = document.getElementById("app");


// LOGIN
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");
const loginError = document.getElementById("loginError");


// SIGNUP
const signupForm = document.getElementById("signupForm");
const signupName = document.getElementById("signupName");
const signupBusiness = document.getElementById("signupBusiness");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupButton = document.getElementById("signupButton");
const signupError = document.getElementById("signupError");


// AUTH SWITCH
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");


// NAVIGATION
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");


// MOBILE MENU
const menuButton = document.getElementById("menuButton");
const sidebar = document.querySelector(".sidebar");


// PROFILE
const profileButton = document.getElementById("profileButton");


// MODAL
const modalOverlay = document.getElementById("modalOverlay");
const closeModalButton = document.getElementById("closeModal");
const modalContent = document.getElementById("modalContent");


// ============================================================
// AUTH SCREEN SWITCHING
// ============================================================

function showLoginForm() {

    if (loginForm) {
        loginForm.style.display = "block";
    }

    if (signupForm) {
        signupForm.style.display = "none";
    }

    if (loginError) {
        loginError.textContent = "";
    }

    if (signupError) {
        signupError.textContent = "";
    }
}


function showSignupForm() {

    if (loginForm) {
        loginForm.style.display = "none";
    }

    if (signupForm) {
        signupForm.style.display = "block";
    }

    if (loginError) {
        loginError.textContent = "";
    }

    if (signupError) {
        signupError.textContent = "";
    }
}


if (showSignup) {

    showSignup.addEventListener("click", function (event) {

        event.preventDefault();

        showSignupForm();
    });
}


if (showLogin) {

    showLogin.addEventListener("click", function (event) {

        event.preventDefault();

        showLoginForm();
    });
}


// ============================================================
// LOGIN
// ============================================================

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        loginError.textContent = "";

        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        if (!email || !password) {

            loginError.textContent =
                "Please enter your email and password.";

            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

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

            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }
    });
}


// ============================================================
// SIGN UP
// ============================================================

if (signupForm) {

    signupForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        signupError.textContent = "";

        const name = signupName.value.trim();
        const businessName = signupBusiness.value.trim();
        const email = signupEmail.value.trim();
        const password = signupPassword.value;

        if (!name || !businessName || !email || !password) {

            signupError.textContent =
                "Please fill in all fields.";

            return;
        }

        if (password.length < 6) {

            signupError.textContent =
                "Password must be at least 6 characters.";

            return;
        }

        signupButton.disabled = true;
        signupButton.textContent = "Creating account...";

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            await updateProfile(user, {
                displayName: name
            });

            businessData = structuredClone(defaultData);

            businessData.business.name = businessName;

            await saveCloudData();

            signupForm.reset();

        } catch (error) {

            console.error(error);

            signupError.textContent =
                getAuthErrorMessage(error);

        } finally {

            signupButton.disabled = false;
            signupButton.textContent = "Create Account";
        }
    });
}


// ============================================================
// FIREBASE AUTH STATE
// ============================================================

onAuthStateChanged(auth, async function (user) {

    if (user) {

        console.log("Logged in:", user.email);

        if (authScreen) {
            authScreen.style.display = "none";
        }

        if (appScreen) {
            appScreen.style.display = "block";
        }

        await loadCloudData();

        updateProfileInformation();

        updateEverything();

    } else {

        console.log("No user logged in.");

        if (authScreen) {
            authScreen.style.display = "flex";
        }

        if (appScreen) {
            appScreen.style.display = "none";
        }
    }
});


// ============================================================
// AUTH ERROR MESSAGES
// ============================================================

function getAuthErrorMessage(error) {

    switch (error.code) {

        case "auth/email-already-in-use":
            return "That email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email.";

        case "auth/weak-password":
            return "Password is too weak.";

        case "auth/user-not-found":
            return "No account was found with that email.";

        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/api-key-not-valid":
            return "Firebase API key is invalid. Check your Firebase configuration.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        default:
            return error.message || "Something went wrong.";
    }
}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    try {

        await signOut(auth);

    } catch (error) {

        console.error("Logout failed:", error);
    }
}


document.addEventListener("click", function (event) {

    if (event.target.closest("#logoutButton")) {

        logout();
    }
});


// ============================================================
// NAVIGATION
// ============================================================

const pages = document.querySelectorAll(".page");
const navigationButtons = document.querySelectorAll("[data-page]");


const pageInformation = {

    dashboard: {
        title: "Dashboard",
        subtitle: "Overview of your business"
    },

    sales: {
        title: "Sales",
        subtitle: "Track money coming into your business"
    },

    expenses: {
        title: "Expenses",
        subtitle: "Track your business expenses"
    },

    inventory: {
        title: "Inventory",
        subtitle: "Manage your products and stock"
    },

    customers: {
        title: "Customers",
        subtitle: "Manage your customers"
    },

    receipts: {
        title: "Receipts",
        subtitle: "View your business receipts"
    },

    settings: {
        title: "Settings",
        subtitle: "Manage your business settings"
    }
};


function showPage(pageName) {

    pages.forEach(function (page) {

        page.classList.remove("active");
    });

    const selectedPage =
        document.getElementById(`${pageName}Page`);

    if (selectedPage) {

        selectedPage.classList.add("active");
    }

    navigationButtons.forEach(function (button) {

        button.classList.remove("active");

        if (button.dataset.page === pageName) {

            button.classList.add("active");
        }
    });

    if (pageInformation[pageName]) {

        pageTitle.textContent =
            pageInformation[pageName].title;

        pageSubtitle.textContent =
            pageInformation[pageName].subtitle;
    }

    if (sidebar) {

        sidebar.classList.remove("open");
    }

    updateEverything();
}


navigationButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const pageName = button.dataset.page;

        showPage(pageName);
    });
});


// ============================================================
// MOBILE MENU
// ============================================================

if (menuButton) {

    menuButton.addEventListener("click", function () {

        sidebar.classList.toggle("open");
    });
}


// ============================================================
// MODAL
// ============================================================

function openModal(content) {

    modalContent.innerHTML = content;

    modalOverlay.classList.add("show");
}


function closeModal() {

    modalOverlay.classList.remove("show");

    modalContent.innerHTML = "";
}


if (closeModalButton) {

    closeModalButton.addEventListener(
        "click",
        closeModal
    );
}


if (modalOverlay) {

    modalOverlay.addEventListener("click", function (event) {

        if (event.target === modalOverlay) {

            closeModal();
        }
    });
}


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {

    const today = new Date().toISOString().split("T")[0];

    const todaySales = businessData.sales
        .filter(sale => sale.date === today)
        .reduce((total, sale) => {

            return total + Number(sale.amount || 0);

        }, 0);


    const todayExpenses = businessData.expenses
        .filter(expense => expense.date === today)
        .reduce((total, expense) => {

            return total + Number(expense.amount || 0);

        }, 0);


    const todayProfit =
        todaySales - todayExpenses;


    const businessName =
        document.getElementById("businessName");

    const salesElement =
        document.getElementById("todaySales");

    const expensesElement =
        document.getElementById("todayExpenses");

    const profitElement =
        document.getElementById("todayProfit");

    const productCountElement =
        document.getElementById("productCount");


    if (businessName) {

        businessName.textContent =
            businessData.business.name;
    }


    if (salesElement) {

        salesElement.textContent =
            formatMoney(todaySales);
    }


    if (expensesElement) {

        expensesElement.textContent =
            formatMoney(todayExpenses);
    }


    if (profitElement) {

        profitElement.textContent =
            formatMoney(todayProfit);
    }


    if (productCountElement) {

        productCountElement.textContent =
            businessData.products.length;
    }


    renderRecentActivity();
}


// ============================================================
// MONEY FORMAT
// ============================================================

function formatMoney(amount) {

    const currency =
        businessData.business.currency || "₦";

    return (
        currency +
        Number(amount || 0).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );
}


// ============================================================
// ADD SALE
// ============================================================

const salesAddButton =
    document.getElementById("salesAddButton");

const addSaleButton =
    document.getElementById("addSaleButton");


function showAddSaleModal() {

    const products = businessData.products;

    let productOptions = `
        <option value="">No product</option>
    `;

    products.forEach(function (product) {

        productOptions += `
            <option value="${product.id}">
                ${escapeHTML(product.name)}
                — ${formatMoney(product.price)}
                — Stock: ${product.stock}
            </option>
        `;
    });


    openModal(`

        <div class="modal-header">

            <div>
                <h2>Add Sale</h2>
                <p>Record a new sale</p>
            </div>

        </div>

        <form id="saleForm">

            <label>Product</label>

            <select id="saleProduct">
                ${productOptions}
            </select>


            <label>Amount</label>

            <input
                type="number"
                id="saleAmount"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
            >


            <label>Customer</label>

            <input
                type="text"
                id="saleCustomer"
                placeholder="Customer name"
            >


            <label>Date</label>

            <input
                type="date"
                id="saleDate"
                value="${new Date().toISOString().split("T")[0]}"
                required
            >


            <button
                type="submit"
                class="primary-button full-width"
            >
                Add Sale
            </button>

        </form>
    `);


    const saleProduct =
        document.getElementById("saleProduct");

    const saleAmount =
        document.getElementById("saleAmount");


    saleProduct.addEventListener(
        "change",
        function () {

            const product =
                businessData.products.find(
                    p => p.id === saleProduct.value
                );

            if (product) {

                saleAmount.value =
                    product.price;
            }
        }
    );


    document
        .getElementById("saleForm")
        .addEventListener("submit", async function (event) {

            event.preventDefault();

            const productId =
                document.getElementById("saleProduct").value;

            const amount =
                Number(
                    document.getElementById("saleAmount").value
                );

            const customer =
                document
                    .getElementById("saleCustomer")
                    .value
                    .trim();

            const date =
                document.getElementById("saleDate").value;


            if (!amount || amount <= 0) {

                alert("Enter a valid sale amount.");

                return;
            }


            const product =
                businessData.products.find(
                    p => p.id === productId
                );


            // INVENTORY DEDUCTION
            if (product) {

                if (Number(product.stock) <= 0) {

                    alert(
                        "This product is out of stock."
                    );

                    return;
                }

                product.stock =
                    Number(product.stock) - 1;
            }


            const sale = {

                id: Date.now().toString(),

                productId: productId || null,

                productName:
                    product
                        ? product.name
                        : "General Sale",

                amount: amount,

                customer: customer || "Walk-in Customer",

                date: date,

                createdAt:
                    new Date().toISOString()
            };


            businessData.sales.unshift(sale);


            // CREATE RECEIPT
            const receipt = {

                id:
                    "REC-" +
                    Date.now(),

                saleId:
                    sale.id,

                productName:
                    sale.productName,

                amount:
                    sale.amount,

                customer:
                    sale.customer,

                date:
                    sale.date,

                createdAt:
                    new Date().toISOString()
            };


            businessData.receipts.unshift(receipt);


            await saveCloudData();

            updateEverything();

            closeModal();

            alert("Sale added successfully.");
        });
}


if (salesAddButton) {

    salesAddButton.addEventListener(
        "click",
        showAddSaleModal
    );
}


if (addSaleButton) {

    addSaleButton.addEventListener(
        "click",
        showAddSaleModal
    );
}


// ============================================================
// ADD EXPENSE
// ============================================================

const expensesAddButton =
    document.getElementById("expensesAddButton");

const addExpenseButton =
    document.getElementById("addExpenseButton");


function showAddExpenseModal() {

    openModal(`

        <div class="modal-header">

            <div>
                <h2>Add Expense</h2>
                <p>Record a business expense</p>
            </div>

        </div>


        <form id="expenseForm">

            <label>Description</label>

            <input
                type="text"
                id="expenseDescription"
                placeholder="e.g. Transport"
                required
            >


            <label>Amount</label>

            <input
                type="number"
                id="expenseAmount"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
            >


            <label>Date</label>

            <input
                type="date"
                id="expenseDate"
                value="${new Date().toISOString().split("T")[0]}"
                required
            >


            <button
                type="submit"
                class="primary-button full-width"
            >
                Add Expense
            </button>

        </form>
    `);


    document
        .getElementById("expenseForm")
        .addEventListener("submit", async function (event) {

            event.preventDefault();


            const description =
                document
                    .getElementById("expenseDescription")
                    .value
                    .trim();


            const amount =
                Number(
                    document
                        .getElementById("expenseAmount")
                        .value
                );


            const date =
                document
                    .getElementById("expenseDate")
                    .value;


            if (!description || !amount || amount <= 0) {

                alert("Enter valid expense information.");

                return;
            }


            businessData.expenses.unshift({

                id: Date.now().toString(),

                description,

                amount,

                date,

                createdAt:
                    new Date().toISOString()
            });


            await saveCloudData();

            updateEverything();

            closeModal();

            alert("Expense added successfully.");
        });
}


if (expensesAddButton) {

    expensesAddButton.addEventListener(
        "click",
        showAddExpenseModal
    );
}


if (addExpenseButton) {

    addExpenseButton.addEventListener(
        "click",
        showAddExpenseModal
    );
}


// ============================================================
// ADD PRODUCT
// ============================================================

const inventoryAddButton =
    document.getElementById("inventoryAddButton");

const addProductButton =
    document.getElementById("addProductButton");


function showAddProductModal() {

    openModal(`

        <div class="modal-header">

            <div>
                <h2>Add Product</h2>
                <p>Add an item to your inventory</p>
            </div>

        </div>


        <form id="productForm">

            <label>Product Name</label>

            <input
                type="text"
                id="productName"
                placeholder="e.g. Sneakers"
                required
            >


            <label>Price</label>

            <input
                type="number"
                id="productPrice"
                placeholder="Selling price"
                min="0"
                step="0.01"
                required
            >


            <label>Stock</label>

            <input
                type="number"
                id="productStock"
                placeholder="Quantity"
                min="0"
                step="1"
                required
            >


            <button
                type="submit"
                class="primary-button full-width"
            >
                Add Product
            </button>

        </form>
    `);


    document
        .getElementById("productForm")
        .addEventListener("submit", async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("productName")
                    .value
                    .trim();


            const price =
                Number(
                    document
                        .getElementById("productPrice")
                        .value
                );


            const stock =
                Number(
                    document
                        .getElementById("productStock")
                        .value
                );


            if (!name || price < 0 || stock < 0) {

                alert("Enter valid product information.");

                return;
            }


            businessData.products.push({

                id: Date.now().toString(),

                name,

                price,

                stock,

                createdAt:
                    new Date().toISOString()
            });


            await saveCloudData();

            updateEverything();

            closeModal();

            alert("Product added successfully.");
        });
}


if (inventoryAddButton) {

    inventoryAddButton.addEventListener(
        "click",
        showAddProductModal
    );
}


if (addProductButton) {

    addProductButton.addEventListener(
        "click",
        showAddProductModal
    );
}


// ============================================================
// ADD CUSTOMER
// ============================================================

const customerAddButton =
    document.getElementById("customerAddButton");


function showAddCustomerModal() {

    openModal(`

        <div class="modal-header">

            <div>
                <h2>Add Customer</h2>
                <p>Save a customer</p>
            </div>

        </div>


        <form id="customerForm">

            <label>Customer Name</label>

            <input
                type="text"
                id="customerName"
                placeholder="Full name"
                required
            >


            <label>Phone</label>

            <input
                type="tel"
                id="customerPhone"
                placeholder="Phone number"
            >


            <label>Email</label>

            <input
                type="email"
                id="customerEmail"
                placeholder="Email address"
            >


            <button
                type="submit"
                class="primary-button full-width"
            >
                Add Customer
            </button>

        </form>
    `);


    document
        .getElementById("customerForm")
        .addEventListener("submit", async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("customerName")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("customerPhone")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("customerEmail")
                    .value
                    .trim();


            if (!name) {

                alert("Enter the customer's name.");

                return;
            }


            businessData.customers.push({

                id: Date.now().toString(),

                name,

                phone,

                email,

                createdAt:
                    new Date().toISOString()
            });


            await saveCloudData();

            updateEverything();

            closeModal();

            alert("Customer added successfully.");
        });
}


if (customerAddButton) {

    customerAddButton.addEventListener(
        "click",
        showAddCustomerModal
    );
}


// ============================================================
// RENDER SALES
// ============================================================

function renderSales() {

    const container =
        document.getElementById("salesList");

    if (!container) return;


    if (businessData.sales.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No sales recorded yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        businessData.sales.map(function (sale) {

            return `

                <div class="data-row">

                    <div>

                        <strong>
                            ${escapeHTML(sale.productName)}
                        </strong>

                        <small>
                            ${escapeHTML(sale.customer)}
                        </small>

                    </div>


                    <div>

                        <strong>
                            ${formatMoney(sale.amount)}
                        </strong>

                        <small>
                            ${escapeHTML(sale.date)}
                        </small>

                    </div>

                </div>
            `;

        }).join("");
}


// ============================================================
// RENDER EXPENSES
// ============================================================

function renderExpenses() {

    const container =
        document.getElementById("expensesList");

    if (!container) return;


    if (businessData.expenses.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No expenses recorded yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        businessData.expenses.map(function (expense) {

            return `

                <div class="data-row">

                    <div>

                        <strong>
                            ${escapeHTML(expense.description)}
                        </strong>

                        <small>
                            ${escapeHTML(expense.date)}
                        </small>

                    </div>


                    <strong>
                        ${formatMoney(expense.amount)}
                    </strong>

                </div>
            `;

        }).join("");
}


// ============================================================
// RENDER INVENTORY
// ============================================================

function renderInventory() {

    const container =
        document.getElementById("productsList");

    if (!container) return;


    if (businessData.products.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No products in inventory yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        businessData.products.map(function (product) {

            let stockClass = "";

            if (Number(product.stock) === 0) {

                stockClass = "stock-out";

            } else if (Number(product.stock) <= 5) {

                stockClass = "stock-low";
            }


            return `

                <div class="data-row">

                    <div>

                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <small>
                            ${formatMoney(product.price)}
                        </small>

                    </div>


                    <div class="${stockClass}">

                        <strong>
                            ${product.stock}
                        </strong>

                        <small>
                            ${product.stock === 1
                                ? "item"
                                : "items"}
                        </small>

                    </div>

                </div>
            `;

        }).join("");
}


// ============================================================
// RENDER CUSTOMERS
// ============================================================

function renderCustomers() {

    const container =
        document.getElementById("customersList");

    if (!container) return;


    if (businessData.customers.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No customers added yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        businessData.customers.map(function (customer) {

            return `

                <div class="data-row">

                    <div>

                        <strong>
                            ${escapeHTML(customer.name)}
                        </strong>

                        <small>
                            ${escapeHTML(customer.phone || "No phone")}
                        </small>

                    </div>


                    <small>
                        ${escapeHTML(customer.email || "No email")}
                    </small>

                </div>
            `;

        }).join("");
}


// ============================================================
// RENDER RECEIPTS
// ============================================================

function renderReceipts() {

    const container =
        document.getElementById("receiptsList");

    if (!container) return;


    if (businessData.receipts.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No receipts yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        businessData.receipts.map(function (receipt) {

            return `

                <div class="data-row">

                    <div>

                        <strong>
                            ${escapeHTML(receipt.id)}
                        </strong>

                        <small>
                            ${escapeHTML(receipt.customer)}
                        </small>

                    </div>


                    <div>

                        <strong>
                            ${formatMoney(receipt.amount)}
                        </strong>

                        <button
                            class="small-button"
                            data-receipt-id="${receipt.id}"
                        >
                            View
                        </button>

                    </div>

                </div>
            `;

        }).join("");


    container
        .querySelectorAll("[data-receipt-id]")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const receipt =
                        businessData.receipts.find(
                            r =>
                                r.id ===
                                button.dataset.receiptId
                        );

                    if (receipt) {

                        showReceipt(receipt);
                    }
                }
            );
        });
}


// ============================================================
// VIEW RECEIPT
// ============================================================

function showReceipt(receipt) {

    openModal(`

        <div
            id="printReceipt"
            class="receipt"
        >

            <div class="receipt-header">

                <h2>
                    ${escapeHTML(
                        businessData.business.name
                    )}
                </h2>

                <p>
                    Receipt
                </p>

            </div>


            <div class="receipt-details">

                <p>
                    <strong>Receipt:</strong>
                    ${escapeHTML(receipt.id)}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${escapeHTML(receipt.date)}
                </p>

                <p>
                    <strong>Customer:</strong>
                    ${escapeHTML(receipt.customer)}
                </p>

            </div>


            <div class="receipt-total">

                <span>Total</span>

                <strong>
                    ${formatMoney(receipt.amount)}
                </strong>

            </div>


            <button
                class="primary-button full-width"
                onclick="window.print()"
            >
                Print Receipt
            </button>

        </div>
    `);
}


// ============================================================
// RECENT ACTIVITY
// ============================================================

function renderRecentActivity() {

    const container =
        document.getElementById("recentActivity");

    if (!container) return;


    const sales =
        businessData.sales.slice(0, 5).map(function (sale) {

            return {

                type: "sale",

                title:
                    "Sale: " +
                    sale.productName,

                amount:
                    sale.amount,

                date:
                    sale.date
            };
        });


    const expenses =
        businessData.expenses.slice(0, 5).map(function (expense) {

            return {

                type: "expense",

                title:
                    "Expense: " +
                    expense.description,

                amount:
                    expense.amount,

                date:
                    expense.date
            };
        });


    const activities =
        [...sales, ...expenses]
            .sort(function (a, b) {

                return new Date(b.date) -
                    new Date(a.date);

            })
            .slice(0, 5);


    if (activities.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No recent activity.
            </div>
        `;

        return;
    }


    container.innerHTML =
        activities.map(function (activity) {

            return `

                <div class="activity-item">

                    <div>

                        <strong>
                            ${escapeHTML(activity.title)}
                        </strong>

                        <small>
                            ${escapeHTML(activity.date)}
                        </small>

                    </div>


                    <strong>
                        ${formatMoney(activity.amount)}
                    </strong>

                </div>
            `;

        }).join("");
}


// ============================================================
// SETTINGS
// ============================================================

const saveSettingsButton =
    document.getElementById("saveSettingsButton");

const clearDataButton =
    document.getElementById("clearDataButton");


function updateSettings() {

    const accountEmail =
        document.getElementById("accountEmail");

    const businessNameInput =
        document.getElementById("businessNameInput");

    const currencyInput =
        document.getElementById("currencyInput");


    if (accountEmail && auth.currentUser) {

        accountEmail.value =
            auth.currentUser.email || "";
    }


    if (businessNameInput) {

        businessNameInput.value =
            businessData.business.name;
    }


    if (currencyInput) {

        currencyInput.value =
            businessData.business.currency;
    }
}


if (saveSettingsButton) {

    saveSettingsButton.addEventListener(
        "click",
        async function () {

            const businessNameInput =
                document.getElementById(
                    "businessNameInput"
                );

            const currencyInput =
                document.getElementById(
                    "currencyInput"
                );


            const businessName =
                businessNameInput.value.trim();


            const currency =
                currencyInput.value.trim();


            if (!businessName) {

                alert(
                    "Please enter your business name."
                );

                return;
            }


            businessData.business.name =
                businessName;


            businessData.business.currency =
                currency || "₦";


            await saveCloudData();

            updateEverything();

            alert("Settings saved.");
        }
    );
}


// ============================================================
// CLEAR LOCAL DATA
// ============================================================

if (clearDataButton) {

    clearDataButton.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Clear the locally saved data on this device?"
                );


            if (!confirmed) return;


            localStorage.removeItem(
                LOCAL_KEY
            );


            alert(
                "Local data cleared. Cloud data remains safe."
            );


            location.reload();
        }
    );
}


// ============================================================
// PROFILE BUTTON
// ============================================================

if (profileButton) {

    profileButton.addEventListener(
        "click",
        function () {

            showPage("settings");
        }
    );
}


// ============================================================
// UPDATE PROFILE INFORMATION
// ============================================================

function updateProfileInformation() {

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");


    if (!auth.currentUser) return;


    if (profileName) {

        profileName.textContent =
            auth.currentUser.displayName ||
            "Business Owner";
    }


    if (profileEmail) {

        profileEmail.textContent =
            auth.currentUser.email || "";
    }
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// UPDATE EVERYTHING
// ============================================================

function updateEverything() {

    updateDashboard();

    renderSales();

    renderExpenses();

    renderInventory();

    renderCustomers();

    renderReceipts();

    updateSettings();

    updateProfileInformation();
}


// ============================================================
// START APP
// ============================================================

showPage("dashboard");

console.log("vBusiness is running.");