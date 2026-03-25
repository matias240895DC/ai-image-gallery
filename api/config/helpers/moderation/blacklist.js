/**
 * Blacklist de términos prohibidos para la generación de contenido por IA.
 * Blacklist of forbidden terms for AI content generation.
 * 
 * Este array actúa como la PRIMERA LÍNEA DE DEFENSA (Filtro Local). 
 * This array acts as the FIRST LINE OF DEFENSE (Local Filter).
 * 
 * Bloquea instantáneamente peticiones que contengan palabras relacionadas con:
 * Instantly blocks requests containing words related to:
 * - Racismo y discriminación / Racism and discrimination.
 * - Violencia, odio y terrorismo / Violence, hate, and terrorism.
 * - Abuso, acoso y explotación infantil / Abuse, harassment, and child exploitation.
 * - Contenido adulto u ofensivo / Adult or offensive content.
 * 
 * El controlador 'article.js' utiliza esta lista antes de procesar cualquier 
 * solicitud con la IA de Hugging Face para garantizar la seguridad y 
 * deslindar responsabilidad legal.
 * 
 * The 'article.js' controller uses this list before processing any request 
 * with Hugging Face AI to ensure security and disclaim legal liability.
 */
export const forbiddenWords = [
  // Racismo y Discriminación / Racism and Discrimination
  "ni**a", "negr***", "sudaca", "panchito", "moromier", "moro", "gitano", "machista", "feminazi",
  "racista", "xenofobo", "homofobo", "transfobo",
  // Violencia y Odio / Violence and Hate
  "matar", "asesinar", "muerte", "sangre", "tortura", "violacion", "terrorismo", "bomba", "atentado",
  // Abuso y Acoso / Abuse and Harassment
  "acoso", "bullying", "maltrato", "abuso", "explotacion", "pedofilia", "infantil", "secuestro",
  // Contenido Adulto / Ofensivo común // Adult / Common Offensive Content
  "p*ta", "p*to", "mierda", "c***n", "gilipollas", "zorra", "perra", "sexo", "porno", "desnudo",
  // English common offensive terms (as requested for "etc entre otras")
  "nazi", "hitler", "kill", "murder", "rape", "hate", "fuck", "bitch", "shit", "abuse", "harassment", "naked", "porn"
];