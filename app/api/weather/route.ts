import { NextRequest, NextResponse } from 'next/server';

// Mock weather data generator
function generateWeatherData() {
  const locations = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Berlin'];
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Clear', 'Windy'];

  const location = locations[Math.floor(Math.random() * locations.length)];
  const temperature = Math.round(15 + Math.random() * 20); // 15-35°C
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const humidity = Math.round(30 + Math.random() * 50); // 30-80%
  const windSpeed = Math.round(5 + Math.random() * 20); // 5-25 km/h

  return {
    location,
    temperature,
    conditions: condition,
    humidity,
    wind_speed: windSpeed,
    timestamp: new Date().toISOString(),
    unit: {
      temperature: 'celsius',
      wind_speed: 'km/h'
    }
  };
}

export async function GET(request: NextRequest) {
  // The x402 middleware handles payment verification
  // If this code is reached, payment has been verified

  try {
    // Generate weather data
    const weatherData = generateWeatherData();

    // Log the request for monitoring (optional)
    console.log(`Weather API called at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      data: weatherData,
      message: 'Weather data retrieved successfully',
      paid: true, // Indicate this was a paid request
      service: 'x402-weather-api'
    });
  } catch (error) {
    console.error('Error in weather API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to generate weather data'
      },
      { status: 500 }
    );
  }
}

// Also support POST requests
export async function POST(request: NextRequest) {
  try {
    // Parse request body if needed
    const body = await request.json().catch(() => ({}));

    // Generate weather data (could be customized based on body parameters)
    const weatherData = generateWeatherData();

    // If location is specified in body, use it
    if (body.location && typeof body.location === 'string') {
      weatherData.location = body.location;
    }

    return NextResponse.json({
      success: true,
      data: weatherData,
      message: 'Weather data retrieved successfully',
      paid: true,
      service: 'x402-weather-api',
      request: body
    });
  } catch (error) {
    console.error('Error in weather API POST:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process weather request'
      },
      { status: 500 }
    );
  }
}