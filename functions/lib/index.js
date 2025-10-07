"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v1/https");
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
// Initialize Firebase Admin (lazy initialization)
if (!admin.apps.length) {
    admin.initializeApp();
}
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Import and mount routes
const companies_1 = __importDefault(require("./routes/companies"));
const users_1 = __importDefault(require("./routes/users"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const sales_1 = __importDefault(require("./routes/sales"));
const purchases_1 = __importDefault(require("./routes/purchases"));
const stock_1 = __importDefault(require("./routes/stock"));
const itemMaster_1 = __importDefault(require("./routes/itemMaster"));
const batchTracking_1 = __importDefault(require("./routes/batchTracking"));
const inventoryReports_1 = __importDefault(require("./routes/inventoryReports"));
app.use('/admin/companies', companies_1.default);
app.use('/admin/users', users_1.default);
app.use('/inventory', inventory_1.default);
app.use('/sales', sales_1.default);
app.use('/purchases', purchases_1.default);
app.use('/stock', stock_1.default);
app.use('/item-master', itemMaster_1.default);
app.use('/batch-tracking', batchTracking_1.default);
app.use('/inventory-reports', inventoryReports_1.default);
// Legacy endpoints (keeping for backward compatibility)
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password required' });
        return;
    }
    res.json({
        success: true,
        message: 'Login endpoint ready',
        email
    });
});
// Legacy companies endpoints (keeping for backward compatibility)
app.get('/companies', async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection('companies').get();
        const companies = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json({ success: true, companies });
    }
    catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/companies', async (req, res) => {
    try {
        const { name, code, harachiId } = req.body;
        if (!name || !code) {
            res.status(400).json({ error: 'Name and code are required' });
            return;
        }
        const docRef = await admin.firestore().collection('companies').add({
            name,
            code,
            harachiId: harachiId || 'default',
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            id: docRef.id
        });
    }
    catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 404 handler
app.use('*', errorHandler_1.notFound);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Export the Express app as a Cloud Function (1st Gen)
exports.api = (0, https_1.onRequest)(app);
// Export Firestore triggers
__exportStar(require("./triggers"), exports);
