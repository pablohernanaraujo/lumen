import React, { type FC } from 'react';

import { Body1, Container, ContentWrapper, H2, VStack } from '../../../ui';

export const TermsModalScreen: FC = () => (
  <Container disableSafeArea>
    <ContentWrapper variant="header">
      <VStack spacing="md">
        <VStack spacing="sm">
          <H2>1. Aceptación de términos</H2>
          <Body1>
            Al acceder y utilizar la aplicación Lumen, usted acepta estar sujeto
            a estos términos y condiciones de uso, todas las leyes y
            regulaciones aplicables, y acepta que es responsable del
            cumplimiento de las leyes locales aplicables.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>2. Uso de la licencia</H2>
          <Body1>
            Se otorga permiso para descargar temporalmente una copia de los
            materiales en Lumen únicamente para visualización transitoria
            personal y no comercial. Esta es la concesión de una licencia, no
            una transferencia de título.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>3. Descargo de responsabilidad</H2>
          <Body1>
            Los materiales en el sitio web de Lumen se proporcionan "como
            están". Lumen no ofrece garantías, expresas o implícitas, y por este
            medio renuncia y niega todas las demás garantías, incluidas, entre
            otras, las garantías implícitas o condiciones de comerciabilidad.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>4. Limitaciones</H2>
          <Body1>
            En ningún caso Lumen o sus proveedores serán responsables de ningún
            daño (incluidos, entre otros, daños por pérdida de datos o
            ganancias, o debido a la interrupción del negocio) que surja del uso
            o la incapacidad de usar los materiales en Lumen.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>5. Precisión de los materiales</H2>
          <Body1>
            Los materiales que aparecen en Lumen pueden incluir errores
            técnicos, tipográficos o fotográficos. Lumen no garantiza que
            ninguno de los materiales en su sitio web sea preciso, completo o
            actual.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>6. Enlaces</H2>
          <Body1>
            Lumen no ha revisado todos los sitios vinculados a nuestra
            aplicación y no es responsable del contenido de ningún sitio
            vinculado. La inclusión de cualquier enlace no implica respaldo por
            parte de Lumen del sitio.
          </Body1>
        </VStack>

        <VStack spacing="sm">
          <H2>7. Modificaciones</H2>
          <Body1>
            Lumen puede revisar estos términos de servicio para su aplicación en
            cualquier momento sin previo aviso. Al usar esta aplicación, usted
            acepta estar sujeto a la versión actual de estos términos de
            servicio.
          </Body1>
        </VStack>
      </VStack>
    </ContentWrapper>
  </Container>
);
