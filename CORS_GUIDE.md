# CORS y Compatibilidad de Navegadores

## Resumen

Este paquete funciona tanto en **Node.js** como en **navegadores web**, pero con diferentes estrategias para manejar las restricciones CORS de algunos sitios web.

## Comportamiento por Entorno

### 🖥️ Node.js (Recomendado)
- **WordReference**: ✅ Funciona directamente sin restricciones
- **Linguee**: ✅ Funciona directamente sin restricciones
- **Rendimiento**: Óptimo, sin proxies adicionales
- **Confiabilidad**: Máxima

### 🌐 Navegadores Web
- **WordReference**: ✅ Funciona directamente
- **Linguee**: ⚠️ Requiere proxies CORS para algunos pares de idiomas
- **Rendimiento**: Puede ser más lento debido a proxies
- **Confiabilidad**: Buena, con fallbacks automáticos

## Proxies CORS Utilizados

Cuando se ejecuta en navegadores y Linguee bloquea CORS, el paquete automáticamente intenta estos proxies en orden:

1. `https://api.allorigins.win/get?url=` - Proxy principal
2. `https://corsproxy.io/?` - Fallback 1
3. `https://cors-anywhere.herokuapp.com/` - Fallback 2
4. `https://api.codetabs.com/v1/proxy?quest=` - Fallback 3

## Ejemplos de Uso

### Uso Básico (Node.js)
```javascript
import { scrapeLinguee, scrapeWordReference } from 'multi-dictionary-scraper';

// Funciona perfectamente en Node.js
const lingueeResult = await scrapeLinguee('hello', 'en', 'es');
const wrResult = await scrapeWordReference('hello', 'en', 'es');
```

### Uso en Navegador con Manejo de Errores
```javascript
import { scrapeLinguee } from 'multi-dictionary-scraper';

try {
    const result = await scrapeLinguee('hello', 'en', 'ru');
    if (result.translations.length > 0) {
        console.log('Traducciones encontradas:', result.translations);
    } else if (result.error) {
        console.log('Error:', result.error);
        // Fallback a WordReference si Linguee falla
        const wrResult = await scrapeWordReference('hello', 'en', 'ru');
    }
} catch (error) {
    console.log('Error CORS:', error.message);
}
```

## Detección Automática de Entorno

El paquete detecta automáticamente si se está ejecutando en Node.js o en un navegador:

```javascript
// El paquete detecta esto automáticamente
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

if (isBrowser && url.includes('linguee.com')) {
    // Usa proxies CORS automáticamente
    return await makeRequestWithCorsProxy(url);
} else {
    // Petición directa en Node.js
    return await axios.get(url);
}
```

## Solución de Problemas

### Error: "All CORS proxies failed"
- **Causa**: Todos los proxies CORS están bloqueados o no disponibles
- **Solución**: 
  1. Usar Node.js en lugar del navegador
  2. Configurar tu propio proxy CORS
  3. Usar WordReference como alternativa

### Error: "Network Error" en navegador
- **Causa**: Política CORS estricta del sitio web
- **Solución**: El paquete intentará automáticamente usar proxies CORS

### Rendimiento lento en navegador
- **Causa**: Los proxies CORS agregan latencia
- **Solución**: Usar Node.js para mejor rendimiento

## Recomendaciones

1. **Para aplicaciones de servidor**: Usar Node.js siempre que sea posible
2. **Para aplicaciones web**: 
   - Implementar fallbacks entre diccionarios
   - Mostrar indicadores de carga al usuario
   - Manejar errores graciosamente
3. **Para producción**: Considerar implementar tu propio proxy CORS para mayor control

## Pares de Idiomas Más Problemáticos en Navegadores

Algunos pares de idiomas pueden ser más propensos a problemas CORS:
- `en-ru` (inglés-ruso)
- `en-zh` (inglés-chino)
- `en-ar` (inglés-árabe)

Para estos casos, el paquete automáticamente:
1. Intenta múltiples proxies CORS
2. Proporciona mensajes de error descriptivos
3. Sugiere usar Node.js como alternativa
