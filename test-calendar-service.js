// Test script for Calendar Service API endpoints
const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_USER_ID = '24312c0a-6317-4741-9330-ff581e2a24f3'; // admin@hopeai.com UUID
const TEST_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440000'; // Replace with a valid patient ID

// Test data
const testAppointment = {
  title: 'Test Appointment',
  patientId: TEST_PATIENT_ID,
  userId: TEST_USER_ID,
  date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  duration: 60,
  status: 'SCHEDULED',
  notes: 'This is a test appointment',
  location: 'Virtual',
  isRecurring: false,
  notificationPreference: 'email',
  colorCode: '#3788d8',
};

const testRecurringAppointment = {
  ...testAppointment,
  title: 'Test Recurring Appointment',
  isRecurring: true,
  recurrencePattern: 'weekly',
  recurrenceEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
};

// Helper function to format dates for API requests
const formatDate = (date) => {
  return date.toISOString();
};

// Test functions
async function testGetAppointments() {
  console.log('\n--- Testing GET /appointments ---');
  try {
    const response = await axios.get(`${API_BASE_URL}/appointments`, {
      params: { userId: TEST_USER_ID }
    });
    console.log(`✅ GET /appointments - Success (${response.data.length} appointments found)`);
    return response.data;
  } catch (error) {
    console.error('❌ GET /appointments - Failed:', error.message);
    throw error;
  }
}

async function testCreateAppointment() {
  console.log('\n--- Testing POST /appointments (Single) ---');
  try {
    const appointmentData = {
      ...testAppointment,
      date: formatDate(testAppointment.date),
    };
    
    const response = await axios.post(`${API_BASE_URL}/appointments`, appointmentData);
    console.log('✅ POST /appointments - Success:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ POST /appointments - Failed:', error.message);
    throw error;
  }
}

async function testCreateRecurringAppointment() {
  console.log('\n--- Testing POST /appointments (Recurring) ---');
  try {
    const appointmentData = {
      ...testRecurringAppointment,
      date: formatDate(testRecurringAppointment.date),
      recurrenceEndDate: formatDate(testRecurringAppointment.recurrenceEndDate),
    };
    
    const response = await axios.post(`${API_BASE_URL}/appointments`, appointmentData);
    console.log('✅ POST /appointments (Recurring) - Success:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ POST /appointments (Recurring) - Failed:', error.message);
    throw error;
  }
}

async function testGetAppointmentById(id) {
  console.log(`\n--- Testing GET /appointments/${id} ---`);
  try {
    const response = await axios.get(`${API_BASE_URL}/appointments/${id}`);
    console.log(`✅ GET /appointments/${id} - Success:`, response.data.title);
    return response.data;
  } catch (error) {
    console.error(`❌ GET /appointments/${id} - Failed:`, error.message);
    throw error;
  }
}

async function testUpdateAppointment(id) {
  console.log(`\n--- Testing PUT /appointments/${id} ---`);
  try {
    const updateData = {
      title: 'Updated Test Appointment',
      notes: 'This appointment has been updated',
      status: 'COMPLETED',
    };
    
    const response = await axios.put(`${API_BASE_URL}/appointments/${id}`, updateData);
    console.log(`✅ PUT /appointments/${id} - Success:`, response.data.title);
    return response.data;
  } catch (error) {
    console.error(`❌ PUT /appointments/${id} - Failed:`, error.message);
    throw error;
  }
}

async function testDeleteAppointment(id) {
  console.log(`\n--- Testing DELETE /appointments/${id} ---`);
  try {
    const response = await axios.delete(`${API_BASE_URL}/appointments/${id}`);
    console.log(`✅ DELETE /appointments/${id} - Success`);
    return response.data;
  } catch (error) {
    console.error(`❌ DELETE /appointments/${id} - Failed:`, error.message);
    throw error;
  }
}

async function testNotifications() {
  console.log('\n--- Testing GET /appointments/notifications ---');
  try {
    const response = await axios.get(`${API_BASE_URL}/appointments/notifications`);
    console.log(`✅ GET /appointments/notifications - Success (${response.data.length} notifications found)`);
    return response.data;
  } catch (error) {
    console.error('❌ GET /appointments/notifications - Failed:', error.message);
    throw error;
  }
}

// Run all tests
async function runTests() {
  console.log('🔍 Starting Calendar Service API Tests');
  
  try {
    // Test getting all appointments
    await testGetAppointments();
    
    // Test creating a single appointment
    const createdAppointment = await testCreateAppointment();
    
    // Test getting a specific appointment
    await testGetAppointmentById(createdAppointment.id);
    
    // Test updating an appointment
    await testUpdateAppointment(createdAppointment.id);
    
    // Test creating a recurring appointment
    const createdRecurringAppointment = await testCreateRecurringAppointment();
    
    // Test notifications
    await testNotifications();
    
    // Test deleting appointments (cleanup)
    await testDeleteAppointment(createdAppointment.id);
    await testDeleteAppointment(createdRecurringAppointment.id);
    
    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();