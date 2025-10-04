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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const db = admin.firestore();
// JWT secret
const JWT_SECRET = functions.config().jwt?.secret || 'your-secret-key';
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
// INVENTORY REPORTS
// Get inventory valuation report
router.get('/valuation', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { branchId, itemClassId, asOfDate } = req.query;
        let stockQuery = db.collection('companies')
            .doc(companyId)
            .collection('stockBalances');
        if (branchId) {
            stockQuery = stockQuery.where('branchId', '==', branchId);
        }
        const stockSnapshot = await stockQuery.get();
        const stockBalances = stockSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Get item details and pricing
        const valuationReport = [];
        let totalValue = 0;
        for (const stock of stockBalances) {
            // Get item details
            const itemDoc = await db.collection('companies')
                .doc(companyId)
                .collection('itemMasters')
                .doc(stock.itemId)
                .get();
            if (!itemDoc.exists)
                continue;
            const itemData = itemDoc.data();
            if (!itemData)
                continue;
            // Filter by item class if specified
            if (itemClassId && itemData.itemClassId !== itemClassId)
                continue;
            // Get item class details
            const itemClassDoc = await db.collection('companies')
                .doc(companyId)
                .collection('itemClasses')
                .doc(itemData.itemClassId)
                .get();
            const itemClassData = itemClassDoc.exists ? itemClassDoc.data() : null;
            // Get UOM details
            const uomDoc = await db.collection('companies')
                .doc(companyId)
                .collection('uoms')
                .doc(stock.uomId)
                .get();
            const uomData = uomDoc.exists ? uomDoc.data() : null;
            // Get branch details
            const branchDoc = await db.collection('companies')
                .doc(companyId)
                .collection('branches')
                .doc(stock.branchId)
                .get();
            const branchData = branchDoc.exists ? branchDoc.data() : null;
            // Calculate value (using unit cost from item master)
            const unitCost = itemData.unitCost || 0;
            const totalCost = stock.quantity * unitCost;
            totalValue += totalCost;
            valuationReport.push({
                itemId: stock.itemId,
                itemName: itemData.name,
                itemCode: itemData.code,
                itemClass: itemClassData?.name || 'Unknown',
                branchName: branchData?.name || 'Unknown',
                uomName: uomData?.name || 'Unknown',
                quantity: stock.quantity,
                unitCost,
                totalCost,
                lastUpdated: stock.lastUpdated
            });
        }
        res.json({
            success: true,
            report: {
                summary: {
                    totalItems: valuationReport.length,
                    totalValue,
                    asOfDate: asOfDate || new Date().toISOString()
                },
                details: valuationReport
            }
        });
    }
    catch (error) {
        console.error('Get inventory valuation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get stock movement report
router.get('/movements', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { itemId, branchId, startDate, endDate, movementType, limit = 100 } = req.query;
        let query = db.collection('companies')
            .doc(companyId)
            .collection('stockMovements')
            .orderBy('createdAt', 'desc')
            .limit(parseInt(limit));
        if (itemId) {
            query = query.where('itemId', '==', itemId);
        }
        if (branchId) {
            query = query.where('branchId', '==', branchId);
        }
        if (movementType) {
            query = query.where('movementType', '==', movementType);
        }
        if (startDate) {
            query = query.where('createdAt', '>=', new Date(startDate));
        }
        if (endDate) {
            query = query.where('createdAt', '<=', new Date(endDate));
        }
        const movementsSnapshot = await query.get();
        const movements = movementsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Get additional details for each movement
        const detailedMovements = [];
        for (const movement of movements) {
            // Get item details
            const itemDoc = await db.collection('companies')
                .doc(companyId)
                .collection('itemMasters')
                .doc(movement.itemId)
                .get();
            const itemData = itemDoc.exists ? itemDoc.data() : null;
            // Get branch details
            const branchDoc = await db.collection('companies')
                .doc(companyId)
                .collection('branches')
                .doc(movement.branchId)
                .get();
            const branchData = branchDoc.exists ? branchDoc.data() : null;
            // Get UOM details
            const uomDoc = await db.collection('companies')
                .doc(companyId)
                .collection('uoms')
                .doc(movement.uomId)
                .get();
            const uomData = uomDoc.exists ? uomDoc.data() : null;
            detailedMovements.push({
                ...movement,
                itemName: itemData?.name || 'Unknown',
                itemCode: itemData?.code || 'Unknown',
                branchName: branchData?.name || 'Unknown',
                uomName: uomData?.name || 'Unknown'
            });
        }
        res.json({
            success: true,
            movements: detailedMovements,
            count: detailedMovements.length
        });
    }
    catch (error) {
        console.error('Get stock movements report error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get ABC analysis report
router.get('/abc-analysis', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { branchId, period = 30 } = req.query;
        // Get stock balances
        let stockQuery = db.collection('companies')
            .doc(companyId)
            .collection('stockBalances');
        if (branchId) {
            stockQuery = stockQuery.where('branchId', '==', branchId);
        }
        const stockSnapshot = await stockQuery.get();
        const stockBalances = stockSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Get item details and calculate values
        const itemValues = [];
        let totalValue = 0;
        for (const stock of stockBalances) {
            const itemDoc = await db.collection('companies')
                .doc(companyId)
                .collection('itemMasters')
                .doc(stock.itemId)
                .get();
            if (!itemDoc.exists)
                continue;
            const itemData = itemDoc.data();
            if (!itemData)
                continue;
            const unitCost = itemData.unitCost || 0;
            const totalCost = stock.quantity * unitCost;
            totalValue += totalCost;
            itemValues.push({
                itemId: stock.itemId,
                itemName: itemData.name,
                itemCode: itemData.code,
                quantity: stock.quantity,
                unitCost,
                totalValue: totalCost
            });
        }
        // Sort by total value (descending)
        itemValues.sort((a, b) => b.totalValue - a.totalValue);
        // Calculate ABC categories
        const abcAnalysis = [];
        let cumulativeValue = 0;
        for (let i = 0; i < itemValues.length; i++) {
            const item = itemValues[i];
            cumulativeValue += item.totalValue;
            const percentage = (cumulativeValue / totalValue) * 100;
            let category = 'C';
            if (percentage <= 80) {
                category = 'A';
            }
            else if (percentage <= 95) {
                category = 'B';
            }
            abcAnalysis.push({
                ...item,
                cumulativeValue,
                percentage: parseFloat(percentage.toFixed(2)),
                category
            });
        }
        // Calculate category summaries
        const categorySummary = {
            A: { count: 0, value: 0, percentage: 0 },
            B: { count: 0, value: 0, percentage: 0 },
            C: { count: 0, value: 0, percentage: 0 }
        };
        for (const item of abcAnalysis) {
            categorySummary[item.category].count++;
            categorySummary[item.category].value += item.totalValue;
        }
        // Calculate percentages
        for (const category in categorySummary) {
            const cat = categorySummary[category];
            cat.percentage = parseFloat(((cat.value / totalValue) * 100).toFixed(2));
        }
        res.json({
            success: true,
            analysis: {
                summary: {
                    totalItems: abcAnalysis.length,
                    totalValue,
                    categorySummary
                },
                items: abcAnalysis
            }
        });
    }
    catch (error) {
        console.error('Get ABC analysis error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get slow moving items report
router.get('/slow-moving', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { branchId, daysThreshold = 90 } = req.query;
        // Get stock balances
        let stockQuery = db.collection('companies')
            .doc(companyId)
            .collection('stockBalances');
        if (branchId) {
            stockQuery = stockQuery.where('branchId', '==', branchId);
        }
        const stockSnapshot = await stockQuery.get();
        const stockBalances = stockSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        const slowMovingItems = [];
        for (const stock of stockBalances) {
            // Get last movement for this item
            const lastMovementSnapshot = await db.collection('companies')
                .doc(companyId)
                .collection('stockMovements')
                .where('itemId', '==', stock.itemId)
                .where('branchId', '==', stock.branchId)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();
            if (lastMovementSnapshot.empty)
                continue;
            const lastMovement = lastMovementSnapshot.docs[0].data();
            const lastMovementDate = lastMovement.createdAt.toDate();
            const daysSinceLastMovement = Math.floor((Date.now() - lastMovementDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceLastMovement >= parseInt(daysThreshold)) {
                // Get item details
                const itemDoc = await db.collection('companies')
                    .doc(companyId)
                    .collection('itemMasters')
                    .doc(stock.itemId)
                    .get();
                const itemData = itemDoc.exists ? itemDoc.data() : null;
                if (itemData) {
                    slowMovingItems.push({
                        itemId: stock.itemId,
                        itemName: itemData.name,
                        itemCode: itemData.code,
                        quantity: stock.quantity,
                        lastMovementDate,
                        daysSinceLastMovement,
                        unitCost: itemData.unitCost || 0,
                        totalValue: stock.quantity * (itemData.unitCost || 0)
                    });
                }
            }
        }
        // Sort by days since last movement (descending)
        slowMovingItems.sort((a, b) => b.daysSinceLastMovement - a.daysSinceLastMovement);
        res.json({
            success: true,
            report: {
                summary: {
                    totalItems: slowMovingItems.length,
                    threshold: parseInt(daysThreshold),
                    totalValue: slowMovingItems.reduce((sum, item) => sum + item.totalValue, 0)
                },
                items: slowMovingItems
            }
        });
    }
    catch (error) {
        console.error('Get slow moving items error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get inventory turnover report
router.get('/turnover', verifyToken, async (req, res) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({ error: 'Company ID required' });
        }
        const { branchId, period = 365 } = req.query;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));
        // Get all items
        const itemsSnapshot = await db.collection('companies')
            .doc(companyId)
            .collection('itemMasters')
            .where('isActive', '==', true)
            .get();
        const turnoverReport = [];
        for (const itemDoc of itemsSnapshot.docs) {
            const itemData = itemDoc.data();
            if (!itemData)
                continue;
            // Get stock balance
            let stockQuery = db.collection('companies')
                .doc(companyId)
                .collection('stockBalances')
                .where('itemId', '==', itemDoc.id);
            if (branchId) {
                stockQuery = stockQuery.where('branchId', '==', branchId);
            }
            const stockSnapshot = await stockQuery.get();
            const currentStock = stockSnapshot.docs.reduce((sum, doc) => sum + (doc.data().quantity || 0), 0);
            // Get movements in the period
            const movementsSnapshot = await db.collection('companies')
                .doc(companyId)
                .collection('stockMovements')
                .where('itemId', '==', itemDoc.id)
                .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(startDate))
                .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(endDate))
                .get();
            let totalOut = 0;
            for (const movementDoc of movementsSnapshot.docs) {
                const movementData = movementDoc.data();
                if (movementData.movementType === 'OUT') {
                    totalOut += movementData.quantity;
                }
            }
            // Calculate turnover ratio
            const averageStock = currentStock; // Simplified calculation
            const turnoverRatio = averageStock > 0 ? totalOut / averageStock : 0;
            turnoverReport.push({
                itemId: itemDoc.id,
                itemName: itemData.name,
                itemCode: itemData.code,
                currentStock,
                totalOut,
                turnoverRatio: parseFloat(turnoverRatio.toFixed(2)),
                period: parseInt(period)
            });
        }
        // Sort by turnover ratio (ascending - slowest first)
        turnoverReport.sort((a, b) => a.turnoverRatio - b.turnoverRatio);
        res.json({
            success: true,
            report: {
                summary: {
                    totalItems: turnoverReport.length,
                    period: parseInt(period),
                    averageTurnover: turnoverReport.reduce((sum, item) => sum + item.turnoverRatio, 0) / turnoverReport.length
                },
                items: turnoverReport
            }
        });
    }
    catch (error) {
        console.error('Get inventory turnover error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
