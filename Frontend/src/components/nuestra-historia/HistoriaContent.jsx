import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1480px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 0 var(--spacing-md);
  }
`;

/* Banda a todo el ancho: una mitad foto (de borde a borde) y la otra texto. */
const Banner = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Photo = styled.img`
  width: 100%;
  height: 100%;
  min-height: 460px;
  object-fit: cover;
  display: block;

  @media (max-width: 900px) {
    min-height: 320px;
  }
`;

const BannerText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-self: center;
  padding: var(--spacing-xxl);
  max-width: 750px;

  @media (max-width: 900px) {
    padding: var(--spacing-xl) var(--spacing-md);
    max-width: none;
  }
`;

const TextBlock = styled.div`
  color: #280101;
  font-family: var(--font-family-secondary);
  line-height: 1.7;

  p {
    margin: 0 0 var(--spacing-lg);
    color: #280101;
    font-size: 22px;
  }

  p:last-child {
    margin-bottom: 0;
  }

  strong {
    color: #280101;
    font-weight: 600;
    font-size: 22px;
  }
`;

const Title = styled.h1`
  font-family: var(--font-family-primary);
  font-style: italic;
  font-weight: 600;
  font-size: 2.8rem;
  color: #280101;
  letter-spacing: -2%;
  margin: 0 0 var(--spacing-xxl);

  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const FullText = styled.div`
  color: #280101;
  font-family: var(--font-family-secondary);
  line-height: 1.8;
  margin: 4rem 0;
  gap: 20px;
  display: flex;
  flex-direction: column;

  p {
    margin: 0;
    color: #280101;
    font-size: 22px;
    font-weight: 400;
  }

  strong {
    color: #280101;
    font-weight: 600;
    font-size: 22px;
  }
`;

/* La foto de "vestidas" queda por debajo para que la imagen full-width
   final se vea superpuesta por encima de ella. Se recortan 200px de arriba. */
const OverlapWrap = styled.div`
  position: relative;
  z-index: 1;
  overflow: hidden;
  height: 460px;

  @media (max-width: 900px) {
    height: 320px;
    order: -1;
  }
`;

const CroppedPhoto = styled.img`
  width: 100%;
  height: calc(100% + 600px);
  margin-top: -200px;
  object-fit: cover;
  display: block;
`;

const MobileFullPhoto = styled.img`
  display: none;

  @media (max-width: 900px) {
    display: block;
    width: 100%;
  }
`;

const FullPhoto = styled.img`
  width: 100%;
  display: block;
  position: relative;
  z-index: 2;
  margin-top: -80px; /* 70% de los 460px del banner superior */

  @media (max-width: 900px) {
    display: none;
  }
`;

export default function HistoriaContent() {
  return (
    <>
      <Banner>
        <Photo src="/nuestra-historia/foto-vieja.webp" alt="Fundadores de MARYBE en los inicios de la perfumería" />
        <BannerText>
          <TextBlock>
            <Title>Nuestra Historia</Title>
            <p>
              <strong>MARYBE Perfumerías es una empresa familiar fundada en Santiago del Estero en 1969.</strong> Desde sus inicios, creció gracias al trabajo, la tenacidad, la pasión y el compromiso de quienes formaron parte de su camino.
            </p>
            <p>
              A lo largo de los años, supo renovarse, adaptarse a los cambios y evolucionar junto a las necesidades de sus clientes, sin perder nunca de vista aquello que la define: el respeto, la cercanía y su vocación por brindar una atención de calidad.
            </p>
          </TextBlock>
        </BannerText>
      </Banner>

      <Container>
        <FullText>
          <p>
            Hoy, MARYBE continúa en <strong>plena expansión</strong>, impulsada por nuevas generaciones de la familia que mantienen vivo el espíritu de sus fundadores, incorporando nuevas formas de pensar, emprender y responder a un mercado cada vez más dinámico, competitivo y exigente.
          </p>
          <p>
            Trabajamos día a día para ofrecer una experiencia de compra cercana, confiable y especial, en espacios pensados para que cada persona se vea y se sienta mejor. Esta esencia se refleja en cada una de nuestras sucursales, ubicadas en <strong>Santiago del Estero, La Banda y San Miguel de Tucumán</strong>.
          </p>
        </FullText>
      </Container>

      <Banner>
        <BannerText>
          <TextBlock>
            <p>
              <strong>Con más de 50 años de trayectoria</strong>, somos representantes oficiales de reconocidas marcas nacionales e internacionales, reafirmando nuestro compromiso con la excelencia en el servicio y la calidad de cada producto.
            </p>
          </TextBlock>
        </BannerText>
        <OverlapWrap>
          <CroppedPhoto src="/nuestra-historia/vestidas.png" alt="Equipo de MARYBE en una de las sucursales" />
        </OverlapWrap>
      </Banner>

      <FullPhoto src="/contacto/familiaMarybenueva.webp" alt="Familia y equipo de MARYBE Perfumerías" />
      <MobileFullPhoto src="/nuestra-historia/fotomarybe.jpg" alt="Familia y equipo de MARYBE Perfumerías" />
    </>
  );
}
