import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../src/models/Role';

dotenv.config();

// Permission configuration for each role
const rolePermissions = {
  // Superadmin: complete access to everything
  superadmin: {
    petTypes: {
      create: true,
      read: true,
      update: true,
      delete: true,
      getAll: true,
    },
    petCharacteristics: {
      create: true,
      read: true,
      update: true,
      delete: true,
      getAll: true,
    },
    pets: {
      create: true,
      read: true,
      update: true,
      delete: true,
      getAll: true,
    },
    caregiverSearch: {
      read: true,
    },
    reservations: {
      create: true,
      read: true,
      update: true,
      admin: true,
    },
    reviews: {
      create: true,
      read: true,
    },
    posts: {
      create: true,
      read: true,
      delete: true,
      getAll: true,
    },
    comments: {
      create: true,
      getAll: true,
      delete: true,
    },
  },
  // User: can only manage their own pets and view types/characteristics
  user: {
    petTypes: {
      create: false,
      read: true,
      update: false,
      delete: false,
      getAll: true,
    },
    petCharacteristics: {
      create: false,
      read: true,
      update: false,
      delete: false,
      getAll: true,
    },
    pets: {
      create: true,
      read: true,
      update: true,
      delete: true,
      getAll: false, // Only sees their own pets
    },
    caregiverSearch: {
      read: true, // Can search for caregivers
    },
    reservations: {
      create: true,
      read: true,
      update: true,
      admin: false,
    },
    reviews: {
      create: true,
      read: true,
    },
    posts: {
      create: true,
      read: true,
      delete: true,
      getAll: true,
    },
    comments: {
      create: true,
      getAll: true,
      delete: true,
    },
  },
};

async function updateAllRoles() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Successfully connected to MongoDB');

    console.log('\n📋 Updating existing roles...');

    // Get all existing roles
    const existingRoles = await Role.find();
    console.log(`📊 Found ${existingRoles.length} roles:`);
    existingRoles.forEach((role) => {
      console.log(`  - ${role.name} (${role.isSystem ? 'System' : 'Custom'})`);
    });

    let updatedCount = 0;

    for (const role of existingRoles) {
      console.log(`\n🔄 Processing role: ${role.name}`);

      // Show current permissions
      console.log(`  📋 Current permissions:`);
      console.log(
        `     PetTypes.getAll: ${
          role.permissions.petTypes?.getAll || 'undefined'
        }`
      );
      console.log(
        `     PetCharacteristics.getAll: ${
          role.permissions.petCharacteristics?.getAll || 'undefined'
        }`
      );
      console.log(
        `     Pets.getAll: ${role.permissions.pets?.getAll || 'undefined'}`
      );
      console.log(
        `     CaregiverSearch.read: ${
          role.permissions.caregiverSearch?.read || 'undefined'
        }`
      );
      console.log(
        `     Reservations.create: ${
          role.permissions.reservations?.create || 'undefined'
        }`
      );
      console.log(
        `     Posts.create: ${
          role.permissions.posts?.create || 'undefined'
        }`
      );
      console.log(
        `     Comments.create: ${
          role.permissions.comments?.create || 'undefined'
        }`
      );

      // Determine which permissions to assign
      let newPermissions;

      if (role.name === 'superadmin') {
        newPermissions = rolePermissions.superadmin;
        console.log('  🔐 Assigning superadmin permissions (complete access)');
      } else if (role.name === 'user') {
        newPermissions = rolePermissions.user;
        console.log('  👤 Assigning user permissions (own management)');
      } else {
        // For custom roles, assign user permissions by default
        newPermissions = rolePermissions.user;
        console.log('  🎯 Assigning user permissions by default');
      }

      // Update role permissions
      role.permissions.petTypes = newPermissions.petTypes;
      role.permissions.petCharacteristics = newPermissions.petCharacteristics;
      role.permissions.pets = newPermissions.pets;
      role.permissions.caregiverSearch = newPermissions.caregiverSearch;
      role.permissions.reservations = newPermissions.reservations;
      role.permissions.reviews = newPermissions.reviews;
      role.permissions.posts = newPermissions.posts;
      role.permissions.comments = newPermissions.comments;

      await role.save();
      updatedCount++;
      console.log(`  ✅ Role ${role.name} updated successfully`);
    }

    console.log(`\n🎉 Process completed!`);
    console.log(`📈 Roles updated: ${updatedCount}/${existingRoles.length}`);

    // Show permission summary by role
    console.log('\n📋 Permission summary by role:');
    const updatedRoles = await Role.find();

    for (const role of updatedRoles) {
      console.log(`\n🔸 ${role.name.toUpperCase()}:`);
      console.log(
        `   PetTypes: ${
          role.permissions.petTypes.getAll ? 'View all' : 'No access'
        }`
      );
      console.log(
        `   PetCharacteristics: ${
          role.permissions.petCharacteristics.getAll ? 'View all' : 'No access'
        }`
      );
      console.log(
        `   CaregiverSearch: ${
          role.permissions.caregiverSearch?.read
            ? 'Search caregivers'
            : 'No access'
        }`
      );
      console.log(
        `   Reservations: ${
          role.permissions.reservations?.create
            ? 'Create/Read/Update'
            : 'No access'
        } ${role.permissions.reservations?.admin ? '(Admin)' : ''}`
      );

      if (role.permissions.posts?.create) {
        console.log(
          `   Posts: Create, read, delete ${
            role.permissions.posts.getAll ? '(all)' : '(feed only)'
          }`
        );
      } else if (role.permissions.posts?.read) {
        console.log(
          `   Posts: Read only ${
            role.permissions.posts.getAll ? '(all)' : '(feed only)'
          }`
        );
      } else {
        console.log(`   Posts: No access`);
      }

      if (role.permissions.pets.create) {
        console.log(
          `   Pets: Create, read, update, delete ${
            role.permissions.pets.getAll ? '(all)' : '(own)'
          }`
        );
      } else if (role.permissions.pets.read) {
        console.log(
          `   Pets: Read only ${
            role.permissions.pets.getAll ? '(all)' : '(own)'
          }`
        );
      } else {
        console.log(`   Pets: No access`);
      }

      if (role.permissions.comments?.create) {
        console.log(
          `   Comments: Create, read, delete ${
            role.permissions.comments.getAll ? '(all)' : '(feed only)'
          }`
        );
      } else if (role.permissions.comments?.getAll) {
        console.log(
          `   Comments: Read only ${
            role.permissions.comments.getAll ? '(all)' : '(feed only)'
          }`
        );
      } else {
        console.log(`   Comments: No access`);
      }
    }
  } catch (error) {
    console.error('❌ Error during update:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Execute the script
updateAllRoles();
