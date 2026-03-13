const pptxgen = require('pptxgenjs');
const html2pptx = require('./scripts/html2pptx');
const path = require('path');

async function createPresentation() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Kris Hagel';
    pptx.title = 'State of AI - November 2025';
    pptx.subject = 'AI Update for Port of Bremerton';

    const workDir = '.';

    console.log('Converting HTML slides to PowerPoint...');

    // Slide 1: Title
    console.log('Processing slide 1: Title');
    await html2pptx(path.join(workDir, 'slide-01-title.html'), pptx);

    // Slide 2: Timeline
    console.log('Processing slide 2: Timeline');
    await html2pptx(path.join(workDir, 'slide-02-timeline.html'), pptx);

    // Slide 3: Big Picture
    console.log('Processing slide 3: Big Picture');
    await html2pptx(path.join(workDir, 'slide-03-big-picture.html'), pptx);

    // Slide 4: Models
    console.log('Processing slide 4: Models');
    await html2pptx(path.join(workDir, 'slide-04-models.html'), pptx);

    // Slide 5: Breakthroughs
    console.log('Processing slide 5: Breakthroughs');
    await html2pptx(path.join(workDir, 'slide-05-breakthroughs.html'), pptx);

    // Slide 6: Enterprise
    console.log('Processing slide 6: Enterprise');
    await html2pptx(path.join(workDir, 'slide-06-enterprise.html'), pptx);

    // Slide 7: Public Sector
    console.log('Processing slide 7: Public Sector');
    await html2pptx(path.join(workDir, 'slide-07-public-sector.html'), pptx);

    // Slide 8: Challenges
    console.log('Processing slide 8: Challenges');
    await html2pptx(path.join(workDir, 'slide-08-challenges.html'), pptx);

    // Slide 9: Democratization
    console.log('Processing slide 9: Democratization');
    await html2pptx(path.join(workDir, 'slide-09-democratization.html'), pptx);

    // Slide 10: Ports
    console.log('Processing slide 10: Ports');
    await html2pptx(path.join(workDir, 'slide-10-ports.html'), pptx);

    // Slide 11: Questions
    console.log('Processing slide 11: Questions');
    await html2pptx(path.join(workDir, 'slide-11-questions.html'), pptx);

    // Slide 12: Closing
    console.log('Processing slide 12: Closing');
    await html2pptx(path.join(workDir, 'slide-12-closing.html'), pptx);

    // Save presentation
    const outputPath = path.join(workDir, 'State-of-AI-Nov-2025-Port-of-Bremerton.pptx');
    await pptx.writeFile({ fileName: outputPath });
    console.log(`\nPresentation created successfully: ${outputPath}`);
}

createPresentation().catch(err => {
    console.error('Error creating presentation:', err);
    process.exit(1);
});
