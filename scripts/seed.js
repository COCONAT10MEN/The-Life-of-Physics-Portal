const { PrismaClient } = require('@prisma/client');

const database = new PrismaClient();

async function main() {
	try {
		await database.category.createMany({
			data: [
				{ name: 'Mechanics' },
				{ name: 'Waves' },
				{ name: 'Electricity' },
				{ name: 'Magnetism' },
				{ name: 'Modern Physics' },
			],
			skipDuplicates: true,
		});
		console.log('Physics course categories seeded successfully');
	} finally {
		await database.$disconnect();
	}
}

main().catch((error) => {
	console.error('Unable to seed categories:', error);
	process.exit(1);
});
