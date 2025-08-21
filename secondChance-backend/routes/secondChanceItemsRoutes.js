const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        //Step 2: task 1 - insert code here
        //Step 2: task 2 - insert code here
        //Step 2: task 3 - insert code here
        //Step 2: task 4 - insert code here
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const secondChanceItems = await collection.find({}).toArray();
        res.json(secondChanceItems);
    } catch (error) {
        logger.console.error('oops something went wrong', error)
        next(error);
    }
});

// Add a new item
router.post('/', upload.single("file"), async(req, res,next) => {
    try {

        //Step 3: task 1 - insert code here
        const db = await connectToDatabase();
        //Step 3: task 2 - insert code here
        const collection = db.collection("secondChanceItems");
        //Step 3: task 3 - insert code here
        let secondChanceItem = req.body;
        //Step 3: task 4 - insert code here
        const lastItemQuery = await collection.find().sort({ id: -1 }).limit(1);
            await lastItemQuery.forEach((item) => {
            secondChanceItem.id = (parseInt(item.id) + 1).toString();
        });

        if (!secondChanceItem.id) {
            secondChanceItem.id = "1";
        }
        //Step 3: task 5 - insert code here
        const date_added = Math.floor(new Date().getTime() / 1000);
        secondChanceItem.date_added = date_added;

        // ✅ Task 6: Save to DB
        const result = await collection.insertOne(secondChanceItem);

        if(result) {
            res.json({"uploaded":"success"});
        } else {
            res.json({"uploaded":"failed"});
        }
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        // Task 1: Retrieve DB connection
        const db = await connectToDatabase();

        // Task 2: Get collection
        const collection = db.collection("secondChanceItems");

        // Task 3: Find specific item by id
        const id = req.params.id; // capture the :id from the route
        const secondChanceItem = await collection.findOne({ id: id });

        // Task 4: Return item or error if not found
        if (!secondChanceItem) {
        return res.status(404).send("secondChanceItem not found");
        }

        res.json(secondChanceItem);
    } catch (e) {
        next(e);
    }
});

// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        // Task 1: Retrieve DB connection
        const db = await connectToDatabase();

        // Task 2: Get collection
        const collection = db.collection("secondChanceItems");

        const id = req.params.id;

        // Task 3: Check if item exists
        const secondChanceItem = await collection.findOne({ id });
        if (!secondChanceItem) {
            console.error("secondChanceItem not found");
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        // Task 4: Update attributes
        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number(
            (secondChanceItem.age_days / 365).toFixed(1)
        );
        secondChanceItem.updatedAt = new Date();

        const updateResult = await collection.findOneAndUpdate(
            { id },
            { $set: secondChanceItem },
            { returnDocument: "after" }
        );

        // Task 5: Send confirmation
        if (updateResult.value) {
            res.json({ uploaded: "success", updatedItem: updateResult.value });
        } else {
            res.json({ uploaded: "failed" });
        }
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    try {
        // Task 1: Retrieve DB connection
        const db = await connectToDatabase();

        // Task 2: Get collection
        const collection = db.collection("secondChanceItems");

        const id = req.params.id;

        // Task 3: Check if item exists
        const secondChanceItem = await collection.findOne({ id });
        if (!secondChanceItem) {
            console.error("secondChanceItem not found");
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        // Task 4: Delete the item
        await collection.deleteOne({ id });

        res.json({ deleted: "success", id });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
