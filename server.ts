import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client utility on the server
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Check slug availability endpoint
app.post('/api/check-slug', (req, res) => {
  const { slug, currentStoreId, existingSlugs } = req.body;
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ valid: false, message: 'Invalid slug' });
  }

  const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
  const reserved = ['admin', 'api', 'dashboard', 'login', 'signup', 'checkout', 'cart', 'settings'];
  
  if (reserved.includes(cleanSlug)) {
    return res.json({ available: false, slug: cleanSlug, reason: 'Reserved system keyword' });
  }

  const isTaken = Array.isArray(existingSlugs) && existingSlugs.includes(cleanSlug);
  res.json({
    available: !isTaken,
    slug: cleanSlug,
    reason: isTaken ? 'Slug already taken by another store' : 'Available',
  });
});

// Secure AI Store Assistant Endpoint
app.post('/api/ai/store-assistant', async (req, res) => {
  try {
    const { question, storeName, currency = 'USD', products = [], orders = [] } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    // 1. Calculate deterministic metrics from trusted store data
    const nonCancelledOrders = orders.filter((o: any) => o.fulfillmentStatus !== 'Cancelled');
    const totalRevenue = nonCancelledOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const totalOrdersCount = nonCancelledOrders.length;
    const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    // Fulfillment status counts
    const pendingFulfillment = orders.filter((o: any) => 
      o.fulfillmentStatus === 'Placed' || o.fulfillmentStatus === 'Packed'
    ).length;

    const fulfillmentBreakdown: Record<string, number> = {};
    orders.forEach((o: any) => {
      const status = o.fulfillmentStatus || 'Placed';
      fulfillmentBreakdown[status] = (fulfillmentBreakdown[status] || 0) + 1;
    });

    // Product sales calculation (units sold & revenue per product)
    const productSalesMap: Record<string, { id: string; name: string; unitsSold: number; revenue: number; category: string }> = {};
    
    // Initialize with known products
    products.forEach((p: any) => {
      productSalesMap[p.id] = {
        id: p.id,
        name: p.name,
        unitsSold: 0,
        revenue: 0,
        category: p.category || 'General',
      };
    });

    // Aggregate from non-cancelled orders
    nonCancelledOrders.forEach((order: any) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const pId = item.productId || item.id;
          if (productSalesMap[pId]) {
            productSalesMap[pId].unitsSold += (item.quantity || 1);
            productSalesMap[pId].revenue += (item.price || 0) * (item.quantity || 1);
          } else {
            productSalesMap[pId] = {
              id: pId,
              name: item.name || 'Unknown item',
              unitsSold: item.quantity || 1,
              revenue: (item.price || 0) * (item.quantity || 1),
              category: item.category || 'General',
            };
          }
        });
      }
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Low stock products (< threshold or default 5)
    const lowStockProducts = products
      .filter((p: any) => (p.stockQuantity ?? p.stock ?? 0) <= (p.lowStockThreshold ?? 5))
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        stock: p.stockQuantity ?? p.stock ?? 0,
        threshold: p.lowStockThreshold ?? 5,
        category: p.category,
      }))
      .slice(0, 8);

    // Category revenue breakdown
    const categoryRevenueMap: Record<string, { revenue: number; units: number }> = {};
    Object.values(productSalesMap).forEach((p) => {
      if (!categoryRevenueMap[p.category]) {
        categoryRevenueMap[p.category] = { revenue: 0, units: 0 };
      }
      categoryRevenueMap[p.category].revenue += p.revenue;
      categoryRevenueMap[p.category].units += p.unitsSold;
    });

    const categoryBreakdown = Object.entries(categoryRevenueMap)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);

    // Build the deterministic data evidence payload
    const evidence = {
      storeName,
      dateRange: 'All recorded store orders to date (Store timezone)',
      metricDefinitions: 'Units sold from completed, non-cancelled orders. Returns/cancelled excluded.',
      totalRevenue: totalRevenue.toFixed(2),
      currency,
      totalOrdersCount,
      avgOrderValue: avgOrderValue.toFixed(2),
      pendingFulfillment,
      fulfillmentBreakdown,
      topSellingProducts: topSellingProducts.map(p => ({
        product: p.name,
        unitsSold: p.unitsSold,
        revenue: `${currency} ${p.revenue.toFixed(2)}`,
        category: p.category,
      })),
      lowStockProducts,
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c.category,
        revenue: `${currency} ${c.revenue.toFixed(2)}`,
        unitsSold: c.units,
      })),
    };

    let answerText = '';

    // If Gemini client is available, pass the exact deterministic data
    if (genAI) {
      try {
        const prompt = `You are the executive AI Store Assistant for the e-commerce store "${storeName}".
The merchant asks: "${question}".

Answer the question strictly and honestly using only the verified deterministic store analytics provided below:
${JSON.stringify(evidence, null, 2)}

Strict rules:
1. Ground your answer completely in the provided store numbers. Do not invent any sales, products, or fake figures.
2. If data for a specific question is not available or no orders exist, explicitly say "I don't have that data" or explain that zero sales have been recorded yet.
3. Be concise, executive, helpful, and highlight concrete action recommendations (e.g. reorder low stock, fulfill awaiting orders).
4. Clearly state the metric definitions and scope.`;

        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        answerText = response.text || '';
      } catch (geminiErr) {
        console.warn('Gemini call failed or timed out, generating deterministic analysis response:', geminiErr);
      }
    }

    // High quality deterministic fallback if Gemini is not configured or failed
    if (!answerText) {
      const lowerQ = question.toLowerCase();

      if (lowerQ.includes('top') || lowerQ.includes('best') || lowerQ.includes('selling') || lowerQ.includes('popular')) {
        if (topSellingProducts.length > 0 && topSellingProducts[0].unitsSold > 0) {
          const list = topSellingProducts
            .filter(p => p.unitsSold > 0)
            .map((p, i) => `${i + 1}. **${p.name}** (${p.unitsSold} units sold, ${currency} ${p.revenue.toFixed(2)})`)
            .join('\n');
          answerText = `Here are your top-selling products based on completed orders:\n\n${list}\n\n**Period:** All active store history\n**Ranking criteria:** Units sold from non-cancelled orders.`;
        } else {
          answerText = `No sales have been recorded yet for your product catalog. Once orders are placed and confirmed, your best-selling products will be ranked here.`;
        }
      } else if (lowerQ.includes('low') || lowerQ.includes('stock') || lowerQ.includes('inventory')) {
        if (lowStockProducts.length > 0) {
          const list = lowStockProducts
            .map((p: any) => `- **${p.name}**: ${p.stock} units remaining (Threshold: ${p.threshold})`)
            .join('\n');
          answerText = `You currently have **${lowStockProducts.length}** product(s) running low on inventory:\n\n${list}\n\n**Recommendation:** Restock these items soon to prevent lost sales.`;
        } else {
          answerText = `Great news! All products in your catalog currently have inventory levels above their respective low-stock alert thresholds.`;
        }
      } else if (lowerQ.includes('order') || lowerQ.includes('ship') || lowerQ.includes('fulfill') || lowerQ.includes('waiting')) {
        answerText = `You currently have **${pendingFulfillment}** order(s) waiting to be shipped/fulfilled (Placed: ${fulfillmentBreakdown['Placed'] || 0}, Packed: ${fulfillmentBreakdown['Packed'] || 0}).\n\nTotal all-time orders: **${orders.length}** across all fulfillment statuses.`;
      } else if (lowerQ.includes('revenue') || lowerQ.includes('sales') || lowerQ.includes('performance') || lowerQ.includes('compare')) {
        answerText = `Your store has generated a total revenue of **${currency} ${totalRevenue.toFixed(2)}** across **${totalOrdersCount}** completed order(s), with an Average Order Value (AOV) of **${currency} ${avgOrderValue.toFixed(2)}**.\n\nTop contributing category: **${categoryBreakdown[0]?.category || 'General'}** (${currency} ${categoryBreakdown[0]?.revenue.toFixed(2) || '0.00'}).`;
      } else if (lowerQ.includes('category')) {
        if (categoryBreakdown.length > 0) {
          const list = categoryBreakdown
            .map(c => `- **${c.category}**: ${currency} ${c.revenue.toFixed(2)} (${c.units} units)`)
            .join('\n');
          answerText = `Here is your category revenue breakdown:\n\n${list}`;
        } else {
          answerText = `No category sales data recorded yet.`;
        }
      } else {
        answerText = `Here is your store summary for **${storeName}**:\n\n- **Total Revenue:** ${currency} ${totalRevenue.toFixed(2)}\n- **Total Orders:** ${totalOrdersCount}\n- **Awaiting Fulfillment:** ${pendingFulfillment}\n- **Low Stock Alerts:** ${lowStockProducts.length} item(s)\n- **Active Products:** ${products.length} item(s)\n\nAsk me specifically about top selling products, low stock, orders to ship, or revenue performance!`;
      }
    }

    res.json({
      answer: answerText,
      evidence,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('AI assistant error:', err);
    res.status(500).json({
      error: 'Failed to process AI query',
      details: err?.message || 'Internal server error',
    });
  }
});

// Vite middleware integration for dev mode or static files for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LaunchYourStore server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
