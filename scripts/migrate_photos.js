import { Photo, ScheduleItem, sequelize } from '../src/models/index.js';

async function migrate() {
  console.log('Starting photo migration...');
  try {
    // Sincroniza o banco para criar a coluna event_id se ela não existir
    console.log('Altering table schema if necessary...');
    await sequelize.sync({ alter: true });
    const photos = await Photo.findAll({
      where: { event_id: null },
      include: [{ model: ScheduleItem, as: 'scheduleItem' }]
    });

    console.log(`Found ${photos.length} photos to migrate.`);

    for (const photo of photos) {
      if (photo.scheduleItem && photo.scheduleItem.event_id) {
        photo.event_id = photo.scheduleItem.event_id;
        await photo.save();
        console.log(`Migrated photo ${photo.id} to event ${photo.event_id}`);
      } else {
        console.warn(`Photo ${photo.id} has no associated schedule item or event_id.`);
      }
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();
