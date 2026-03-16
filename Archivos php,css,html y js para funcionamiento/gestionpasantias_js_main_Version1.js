const pages = {
    home: `
        <section class="section">
            <h2>¡Bienvenido a PasantiConnect!</h2>
            <p>Tu plataforma para conectar pasantes, empresas y oportunidades profesionales. Gestiona pasantías, accede a servicios de asesoría y desarrollo, y potencia tu carrera.</p>
            <div class="features">
                <ul>
                    <li><b>Gestión integral de pasantías:</b> Conecta estudiantes y empresas de forma sencilla y moderna.</li>
                    <li><b>Servicios profesionales:</b> Desarrollo web, marketing digital, consultoría, diseño gráfico y mucho más.</li>
                    <li><b>Seguimiento y soporte:</b> Acompañamiento en todas las fases de tu pasantía.</li>
                </ul>
            </div>
            <div class="partners">
                <h3>Empresas aliadas:</h3>
                <div class="footer-logos">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft"/>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" alt="IBM"/>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Google_Logo.svg" alt="Google"/>
                </div>
            </div>
            <div class="testimonials">
                <h3>Testimonios</h3>
                <blockquote>“Gracias a PasantiConnect conseguí mi primer empleo en tecnología. El proceso fue rápido y el acompañamiento excelente.”<br><b>- Carla R.</b></blockquote>
                <blockquote>“Como empresa, valoramos la facilidad para encontrar y dar seguimiento a los pasantes. ¡Muy recomendable!”<br><b>- Javier S., RH</b></blockquote>
            </div>
            <hr style="margin:40px 0 32px 0;border:0;border-top:1.5px solid #ffd70022;">
            <section id="home-contacto">
                <h2 style="font-size:1.45rem;color:#ffd700;text-shadow:0 2px 8px #0007">¿Tienes preguntas? Contáctanos</h2>
                <p>Estamos aquí para ayudarte. Completa el formulario y te responderemos pronto:</p>
                <form id="contact-form" aria-label="Formulario de contacto">
                    <input type="text" id="name" name="name" placeholder="Nombre completo" required aria-required="true" />
                    <input type="email" id="email" name="email" placeholder="Correo electrónico" required aria-required="true" />
                    <textarea id="message" name="message" placeholder="Tu mensaje" rows="5" required aria-required="true"></textarea>
                    <button type="submit">Enviar Mensaje</button>
                    <p id="form-status" class="form-status" role="alert"></p>
                </form>
            </section>
        </section>
    `,
    servicios: `
        <section class="section">
            <h2>Servicios</h2>
            <ul>
                <li>Desarrollo Web Profesional</li>
                <li>Marketing Digital y SEO</li>
                <li>Consultoría de Negocios</li>
                <li>Diseño gráfico y branding</li>
                <li>Mantenimiento de dispositivos</li>
                <li>Redes y uso de apps de ofimática</li>
                <li>Gestión integral de pasantías</li>
            </ul>
        </section>
    `,
    nosotros: `
        <section class="section">
            <h2>Sobre Nosotros</h2>
            <p>Somos un equipo multidisciplinar dedicado a crear soluciones innovadoras para conectar empresas y pasantes. Nuestra misión es facilitar el desarrollo profesional y la inserción laboral a través de tecnología y procesos eficientes.</p>
            <ul>
                <li>Equipo profesional con experiencia en tecnología, educación y gestión empresarial.</li>
                <li>Plataforma segura y actualizada.</li>
                <li>Soporte personalizado y asesoría continua.</li>
            </ul>
        </section>
    `,
    testimonios: `
        <section class="section">
            <h2>Testimonios</h2>
            <blockquote>“Gracias a PasantiConnect conseguí mi primer empleo en tecnología. El proceso fue rápido y el acompañamiento excelente.”<br><b>- Carla R.</b></blockquote>
            <blockquote>“Como empresa, valoramos la facilidad para encontrar y dar seguimiento a los pasantes. ¡Muy recomendable!”<br><b>- Javier S., RH</b></blockquote>
        </section>
    `,
    blog: `
        <section class="section">
            <h2>Blog & Noticias</h2>
            <ul>
                <li><b>5 consejos para tu primera pasantía</b> - <i>Publicado el 01/06/2025</i></li>
                <li><b>Claves para destacar en el mundo laboral digital</b> - <i>Publicado el 15/05/2025</i></li>
            </ul>
        </section>
    `,
    contacto: `
        <section class="section">
            <h2>Contacto</h2>
            <p>¿Tienes preguntas? No dudes en contactarnos a través del siguiente formulario. Estamos aquí para ayudarte.</p>
            <form id="contact-form" aria-label="Formulario de contacto">
                <input type="text" id="name" name="name" placeholder="Nombre completo" required aria-required="true" />
                <input type="email" id="email" name="email" placeholder="Correo electrónico" required aria-required="true" />
                <textarea id="message" name="message" placeholder="Tu mensaje" rows="5" required aria-required="true"></textarea>
                <button type="submit">Enviar Mensaje</button>
                <p id="form-status" class="form-status" role="alert"></p>
            </form>
        </section>
    `
};

window.pages = pages;