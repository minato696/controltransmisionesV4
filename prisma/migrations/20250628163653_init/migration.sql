-- CreateTable
CREATE TABLE "Ciudades" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ciudades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporteros" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad_id" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporteros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Despachos" (
    "id" SERIAL NOT NULL,
    "reportero_id" INTEGER NOT NULL,
    "numero_despacho" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "hora_despacho" TEXT NOT NULL,
    "hora_en_vivo" TEXT,
    "fecha_despacho" DATE NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'programado',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Despachos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ciudades_codigo_key" ON "Ciudades"("codigo");

-- AddForeignKey
ALTER TABLE "Reporteros" ADD CONSTRAINT "Reporteros_ciudad_id_fkey" FOREIGN KEY ("ciudad_id") REFERENCES "Ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Despachos" ADD CONSTRAINT "Despachos_reportero_id_fkey" FOREIGN KEY ("reportero_id") REFERENCES "Reporteros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
