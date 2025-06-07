import { scrapeWordReference } from './scrapers/wordreference.js';

async function main() {
    console.log('Dictionary Scraper iniciado...');
    
    // Ejemplo de uso del scraper con inglés a ruso
    try {
        console.log('Probando inglés a ruso...');
        const resultRussian = await scrapeWordReference('hello', 'en', 'ru');
        console.log('Resultado inglés-ruso:', JSON.stringify(resultRussian, null, 2));
        
        console.log('\n---\n');
        
        console.log('Probando inglés a español...');
        const resultSpanish = await scrapeWordReference('rainbow', 'en', 'es');
        console.log('Resultado inglés-español:', JSON.stringify(resultSpanish, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { main };
