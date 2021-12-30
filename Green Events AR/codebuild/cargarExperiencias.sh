#!/bin/bash
# SE CREA DIRECTORIO DE PARA DESCARGAR EXPERIENCIAS
mkdir experiencias && cd experiencias || exit

# SE DESCARGAR DIRECTORIO COMPLETO DE LAS EXPERIENCIAS
aws s3 cp --region $REGION_ORIGEN --recursive s3://$BUCKET_SERVICIOS/eventos/$CODIGO .

rm cabecera.png

for d in */; do
  cd "$d" || exit
  unzip -q sitio.zip

  # SE ELIMINAN ARCHIVOS INNECESARIOS
  rm sitio.zip
  rm -rf .*
  rm -rf __MACOSX

  # VALIDA SI EXISTE EL ARCHIVO index.html EXISTE EN EL ZIP DE LA EXPERIENCIA
  if [ ! -f "index.html" ]; then
    aws s3 cp --region $REGION_ORIGEN s3://$BUCKET_SERVICIOS/template/index.html .
  fi

  sed -i "s,{{apiKey}},$API_KEY,g" index.html

  for file in *; do
    if [[ $file == *.glb ]]; then
      sed -i "s,{{glbFile}},$file,g" index.html
    fi
  done

  cd ..
done

cd .. && mv experiencias ../sitio-evento-pwa/dist/sitio-evento-pwa
