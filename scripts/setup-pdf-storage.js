const fs = require('fs');
const path = require('path');

/**
 * Script to set up the directory structure for PDF storage
 */
function setupPdfStorage() {
  console.log('Setting up PDF storage directories...');
  
  // Define the base uploads directory
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Define the reports directory
  const reportsDir = path.join(uploadsDir, 'reports');
  
  // Create the directories if they don't exist
  if (!fs.existsSync(uploadsDir)) {
    console.log(`Creating directory: ${uploadsDir}`);
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  if (!fs.existsSync(reportsDir)) {
    console.log(`Creating directory: ${reportsDir}`);
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Create a .gitkeep file to ensure the directory is tracked by Git
  const gitkeepPath = path.join(reportsDir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    console.log(`Creating .gitkeep file in: ${reportsDir}`);
    fs.writeFileSync(gitkeepPath, '');
  }
  
  console.log('PDF storage directories set up successfully!');
}

// Run the setup function
setupPdfStorage();
