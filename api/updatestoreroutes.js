import express from 'express';
import connectToDatabase from './db/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

async function getCollection() {
  const db = await connectToDatabase();
  return db.collection('users');
}

// the route to update store information
router.put('/users/:userId/store', async (req, res) => {
  const userId = req.params.userId;

  // Check user ID is valid
  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // information from the request body
  const updatedStore = {
    name: req.body.name,
    description: req.body.description,
    location: req.body.location,
    items: req.body.items.map(item => ({
      ...item,
      _id: new ObjectId()
    }))
  };

  try {
    // Get the MongoDB collection
    const collection = await getCollection();

    // Update the store information for the specified user ID
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { store: updatedStore } }
    );

    // Check if the update was successful
    if (result.modifiedCount === 1) {
      return res.status(200).json({ message: 'Store information updated successfully' });
    } else {
      // If no document was modified, the user might not exist
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating store information:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete an item from the store
router.delete('/users/:userId/store/items/:itemId', async (req, res) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // No need to check for ObjectId.isValid for itemId since it's a random string
  if (!itemId) {
    return res.status(400).json({ error: 'Invalid item ID' });
  }

  try {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { 'store.items': { _id: itemId } } }
    );

    if (result.modifiedCount === 1) {
      return res.status(200).json({ message: 'Item removed successfully' });
    } else {
      return res.status(404).json({ error: 'User or item not found' });
    }
  } catch (err) {
    console.error('Error removing item from store:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to edit an item in the store's items array
// Route to edit an item in the store's items array
// Route to edit an item in the store's items array
// Route to update a specific item in the store
router.put('/users/:userId/store/items/:itemId', async (req, res) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;

  // Check if user ID is valid
  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // Ensure the item ID is a string
  if (typeof itemId !== 'string') {
    return res.status(400).json({ error: 'Invalid item ID' });
  }

  const updatedItem = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    _id: itemId // Ensure the _id is preserved as a string
  };

  try {
    const collection = await getCollection();

    // Update the specific item in the store.items array using the string itemId
    const result = await collection.updateOne(
      { _id: new ObjectId(userId), 'store.items._id': itemId },
      { $set: { 'store.items.$': updatedItem } }
    );

    // Check if the update was successful
    if (result.modifiedCount === 1) {
      return res.status(200).json({ message: 'Item updated successfully' });
    } else {
      // If no document was modified, the user or item might not exist
      return res.status(404).json({ error: 'User or item not found' });
    }
  } catch (error) {
    console.error('Error updating item in store:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const generateRandomKey = () => Math.random().toString(36).substring(2, 8).toUpperCase();

router.post('/users/:userId/create-compliment', async (req, res) => {
  try {
    const complimentsArray = req.body; // Expecting an array of compliments
    const userId = new ObjectId(req.params.userId); // Convert userId to ObjectId
    const userCollection = await getCollection();
    const user = await userCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (!user.compliments) {
      user.compliments = [];
    }

    complimentsArray.forEach(complimentGroup => {
      user.compliments.push(complimentGroup);
    });

    await userCollection.updateOne(
      { _id: userId },
      { $set: { compliments: user.compliments } }
    );

    res.status(201).send({ compliments: user.compliments });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while creating compliments' });
  }
});

router.post('/users/:userId/send-compliments', async (req, res) => {
  try {
    const { compliments, followers } = req.body;
    const userCollection = await getCollection();
    const userId = new ObjectId(req.params.userId);

    // Retrieve the sender's user document to get the storeId
    const senderUser = await userCollection.findOne({ _id: userId });
    if (!senderUser || !senderUser.store || !senderUser.store.storeId) {
      console.error('Sender user or store information not found.');
      return res.status(400).send({ error: 'Sender user or store information not found.' });
    }

    const storeId = senderUser.store.storeId;

    console.log(`User ID: ${userId}`);
    console.log(`Compliments: ${JSON.stringify(compliments)}`);
    console.log(`Followers: ${JSON.stringify(followers)}`);
    console.log(`Store ID: ${storeId}`);

    for (const follower of followers) {
      console.log(`Processing follower ID: ${follower._id}`);

      // Get a unique compliment to send to this follower
      const complimentToSend = compliments.find(compliment => !compliment.sent);
      if (!complimentToSend) {
        console.error('No available compliments to send.');
        res.status(400).send({ error: 'No available compliments to send.' });
        return;
      }

      // Create a copy for the follower with updated properties
      const complimentToSendCopy = {
        ...complimentToSend,
        recipient: follower.email,
        sent: true,
        kitchenSent: true,
        storeId: storeId // Add storeId to the compliment
      };

      console.log(`Adding compliment to user ID: ${follower._id}`);
      console.log(`Compliment to send: ${JSON.stringify(complimentToSendCopy)}`);

      const updateFollowerResult = await userCollection.updateOne(
        { _id: new ObjectId(follower._id) },
        { $push: { compliments: complimentToSendCopy } }
      );

      if (updateFollowerResult.modifiedCount === 0) {
        console.error(`Failed to add compliment for user ID: ${follower._id}`);
      } else {
        console.log(`Successfully added compliment for user ID: ${follower._id}`);
      }

      // Update the 'sent' property for the compliment in the sender's document
      console.log(`Updating sent property for compliment ID: ${complimentToSend.id}`);

      // Retrieve the user document to inspect its structure
      const user = await userCollection.findOne({ _id: userId });
      if (!user || !user.compliments) {
        console.error(`User or compliments array not found for user ID: ${userId}`);
        continue;
      }

      console.log(`User compliments: ${JSON.stringify(user.compliments)}`);

      let updated = false;

      // Iterate through all nested arrays to find the correct compliment
      for (let i = 0; i < user.compliments.length; i++) {
        const group = user.compliments[i];
        if (Array.isArray(group)) {
          for (let j = 0; j < group.length; j++) {
            const comp = group[j];
            if (comp.id === complimentToSend.id) {
              user.compliments[i][j].sent = true;
              updated = true;
              break;
            }
          }
        } else if (group.id === complimentToSend.id) {
          user.compliments[i].sent = true;
          updated = true;
        }
        if (updated) break;
      }

      if (updated) {
        const updateResult = await userCollection.updateOne(
          { _id: userId },
          { $set: { compliments: user.compliments } }
        );

        if (updateResult.modifiedCount === 0) {
          console.error(`Failed to update 'sent' property for compliment ID: ${complimentToSend.id}`);
        } else {
          console.log(`Successfully updated 'sent' property for compliment ID: ${complimentToSend.id}`);
        }
      } else {
        console.error(`Compliment ID: ${complimentToSend.id} not found in user document.`);
      }
    }

    res.status(200).send({ message: 'Compliments sent successfully' });
  } catch (error) {
    console.error('Error in send-compliments route:', error);
    res.status(500).send({ error: 'An error occurred while sending compliments' });
  }
});

router.delete('/users/:userId/compliments/group/:groupId', async (req, res) => {
  try {
    const userId = new ObjectId(req.params.userId);
    const groupId = req.params.groupId;
    const userCollection = await getCollection();

    console.log(`User ID: ${userId}`);
    console.log(`Group ID: ${groupId}`);

    // Find user document to log current compliments
    const user = await userCollection.findOne({ _id: userId });
    if (!user) {
      console.error('User not found');
      return res.status(404).send({ error: 'User not found' });
    }

    console.log(`Current compliments: ${JSON.stringify(user.compliments)}`);

    // Find the index of the group with the matching groupId
    const groupIndex = user.compliments.findIndex(group => group[0]?.groupId === groupId);
    if (groupIndex === -1) {
      console.error('Matching group not found');
      return res.status(404).send({ error: 'Matching group not found' });
    }

    console.log(`Found matching group at index: ${groupIndex}`);

    // Remove the group at the found index
    user.compliments.splice(groupIndex, 1);

    const updateResult = await userCollection.updateOne(
      { _id: userId },
      { $set: { compliments: user.compliments } }
    );

    console.log(`Update result: ${JSON.stringify(updateResult)}`);

    if (updateResult.modifiedCount === 0) {
      console.error('Failed to delete the compliment group');
      return res.status(400).send({ error: 'Failed to delete the compliment group' });
    }

    console.log('Successfully deleted the compliment group');
    res.status(200).send({ message: 'Compliment group deleted successfully' });
  } catch (error) {
    console.error('Error in delete-compliments-group route:', error);
    res.status(500).send({ error: 'An error occurred while deleting the compliment group' });
  }
});


router.get('/users/:userId/compliments', async (req, res) => {
  try {
    const userId = new ObjectId(req.params.userId); // Convert userId to ObjectId
    const userCollection = await getCollection();
    const user = await userCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    res.status(200).send({ compliments: user.compliments || [] });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while fetching compliments' });
  }
});

router.get('/users/all', async (req, res) => {
  try {
    const userCollection = await getCollection();
    const users = await userCollection.find({}).toArray();

    res.status(200).send({ users });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while fetching users' });
  }
});

export default router;