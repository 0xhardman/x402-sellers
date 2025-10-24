import { NextRequest, NextResponse } from 'next/server';

// Generate mock market data
function generateMarketData() {
  const assets = ['BTC', 'ETH', 'SOL', 'MATIC', 'ARB'];
  const marketData: any = {};

  assets.forEach(asset => {
    const basePrice = Math.random() * 50000 + 1000;
    marketData[asset] = {
      price: basePrice.toFixed(2),
      change_24h: (Math.random() * 20 - 10).toFixed(2) + '%',
      volume_24h: (Math.random() * 1000000000).toFixed(0),
      market_cap: (basePrice * Math.random() * 10000000).toFixed(0),
      high_24h: (basePrice * 1.05).toFixed(2),
      low_24h: (basePrice * 0.95).toFixed(2)
    };
  });

  return marketData;
}

// Generate trend analysis
function generateTrends() {
  const trendTypes = ['Bullish', 'Bearish', 'Neutral', 'Volatile'];
  const timeframes = ['1h', '4h', '1d', '1w'];
  const trends = [];

  for (let i = 0; i < 5; i++) {
    trends.push({
      asset: ['BTC', 'ETH', 'SOL', 'MATIC', 'ARB'][i],
      trend: trendTypes[Math.floor(Math.random() * trendTypes.length)],
      timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
      strength: Math.round(Math.random() * 100),
      support_level: (Math.random() * 50000 + 1000).toFixed(2),
      resistance_level: (Math.random() * 55000 + 2000).toFixed(2),
      recommendation: ['Buy', 'Sell', 'Hold'][Math.floor(Math.random() * 3)]
    });
  }

  return trends;
}

// Generate predictions
function generatePredictions() {
  return {
    market_sentiment: {
      overall: ['Bullish', 'Bearish', 'Neutral'][Math.floor(Math.random() * 3)],
      fear_greed_index: Math.round(Math.random() * 100),
      social_sentiment_score: (Math.random() * 10).toFixed(2)
    },
    price_predictions: {
      BTC: {
        '1_day': (Math.random() * 60000 + 30000).toFixed(2),
        '1_week': (Math.random() * 65000 + 30000).toFixed(2),
        '1_month': (Math.random() * 70000 + 30000).toFixed(2),
        confidence: (Math.random() * 40 + 60).toFixed(1) + '%'
      },
      ETH: {
        '1_day': (Math.random() * 4000 + 2000).toFixed(2),
        '1_week': (Math.random() * 4500 + 2000).toFixed(2),
        '1_month': (Math.random() * 5000 + 2000).toFixed(2),
        confidence: (Math.random() * 40 + 60).toFixed(1) + '%'
      }
    },
    risk_assessment: {
      volatility_index: (Math.random() * 100).toFixed(2),
      risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      suggested_portfolio_adjustment: ['Increase exposure', 'Maintain current', 'Reduce exposure'][Math.floor(Math.random() * 3)]
    }
  };
}

export async function GET(request: NextRequest) {
  // The x402 middleware handles payment verification
  // If this code is reached, payment has been verified

  try {
    // Simulate processing time for premium data
    await new Promise(resolve => setTimeout(resolve, 500));

    const premiumData = {
      market_data: generateMarketData(),
      trends: generateTrends(),
      predictions: generatePredictions(),
      timestamp: new Date().toISOString(),
      data_quality: 'premium',
      update_frequency: 'real-time',
      next_update: new Date(Date.now() + 300000).toISOString() // 5 minutes
    };

    console.log(`Premium Data API called at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      data: premiumData,
      message: 'Premium market data retrieved successfully',
      paid: true,
      service: 'x402-premium-data-api',
      credits_used: 1
    });
  } catch (error) {
    console.error('Error in premium data API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to generate premium data'
      },
      { status: 500 }
    );
  }
}

// Support POST requests with custom parameters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Allow customization of data based on request
    const assets = body.assets || ['BTC', 'ETH', 'SOL', 'MATIC', 'ARB'];
    const includesPredictions = body.include_predictions !== false;
    const includesTrends = body.include_trends !== false;

    const response: any = {
      success: true,
      data: {
        market_data: generateMarketData(),
        timestamp: new Date().toISOString()
      },
      message: 'Premium data generated based on your request',
      paid: true,
      service: 'x402-premium-data-api'
    };

    if (includesTrends) {
      response.data.trends = generateTrends();
    }

    if (includesPredictions) {
      response.data.predictions = generatePredictions();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in premium data API POST:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process premium data request'
      },
      { status: 500 }
    );
  }
}