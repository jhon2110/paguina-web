import google.generativeai as genai
import os

# Configura tu clave de API (consíguela en Google AI Studio)
genai.configure(api_key="TU_API_KEY_DE_GEMINI")
model = genai.GenerativeModel('gemini-1.5-flash')

def consultar_ia(mensaje_cliente, contexto_productos):
    # Le damos a la IA el "rol" de experto en tu tienda
    prompt = f"""
    Eres el asistente virtual de nuestra tienda. 
    Aquí tienes nuestra lista de productos y modelos: {contexto_productos}
    
    Responde a la duda del cliente de forma amable. 
    Si pregunta por compatibilidad, revisa si el modelo coincide con las características.
    Duda del cliente: {mensaje_cliente}
    """
    
    response = model.generate_content(prompt)
    return response.text