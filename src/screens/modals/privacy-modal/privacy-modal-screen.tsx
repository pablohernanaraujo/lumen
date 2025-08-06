import React, { type FC } from 'react';

import { Body1, Container, ContentWrapper, H2, VStack } from '../../../ui';

export const PrivacyModalScreen: FC = () => (
  <Container disableSafeArea>
    <ContentWrapper variant="header">
      <VStack spacing="md">
        <VStack spacing="sm">
          <H2>Información que recopilamos</H2>
          <Body1>
            Recopilamos información que usted nos proporciona directamente, como
            cuando crea una cuenta, usa nuestros servicios, se comunica con
            nosotros o participa en encuestas o promociones.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>Cómo usamos su información</H2>
          <Body1>
            Utilizamos la información que recopilamos para proporcionar,
            mantener y mejorar nuestros servicios, procesar transacciones,
            enviar comunicaciones técnicas y de marketing, y responder a sus
            comentarios y preguntas.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>Compartir información</H2>
          <Body1>
            No vendemos, intercambiamos ni transferimos de otra manera su
            información personal identificable a terceros. Esto no incluye a
            terceros de confianza que nos ayudan a operar nuestro sitio web o
            aplicación.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>Seguridad de datos</H2>
          <Body1>
            Implementamos una variedad de medidas de seguridad para mantener la
            seguridad de su información personal cuando ingresa, envía o accede
            a su información personal.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>Cookies y tecnologías similares</H2>
          <Body1>
            Utilizamos cookies y tecnologías similares para mejorar su
            experiencia, analizar tendencias, administrar la aplicación y
            recopilar información demográfica sobre nuestra base de usuarios en
            general.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>Sus derechos</H2>
          <Body1>
            Dependiendo de su ubicación, puede tener ciertos derechos con
            respecto a su información personal, incluidos los derechos de
            acceso, portabilidad, rectificación, eliminación y objeción al
            procesamiento.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>Cambios en esta política</H2>
          <Body1>
            Nos reservamos el derecho de actualizar o cambiar nuestra Política
            de Privacidad en cualquier momento. Le notificaremos cualquier
            cambio publicando la nueva Política de Privacidad en esta página.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>Contacto</H2>
          <Body1>
            Si tiene alguna pregunta sobre esta Política de Privacidad, puede
            contactarnos a través de los canales de comunicación disponibles en
            nuestra aplicación.
          </Body1>
        </VStack>
      </VStack>
    </ContentWrapper>
  </Container>
);
