const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.hello = functions.https.onRequest((req, res) => {
	return res.status(200).send("Hello World!");
});

exports.createBlog = functions.https.onRequest(async (req, res) => {
	try {
		const data = req.body;
		const result = await admin.firestore().collection("blogs").add(data);
		return res.status(200).json({
			success: true,
			id: result.id,
			blog: result,
		});
	} catch (error) {
		return res.status(500).json({
			error: error,
			success: false,
			message: "Error in creating blog",
		});
	}
});

exports.updateBlog = functions.https.onRequest(async (req, res) => {
	try {
		const { id, ...data } = req.body;

		await admin.firestore().collection("blogs").doc(id).update(data);
		return res.status(200).json({
			success: true,
			message: "The Blog has been updated",
		});
	} catch (error) {
		return res.status(500).json({
			error: error,
			success: false,
			message: "Error in updating blog",
		});
	}
});

exports.getAllBlogs = functions.https.onRequest(async (req, res) => {
	try {
		const snapshot = await admin.firestore().collection("blogs").get();
		const blogs = [];
		snapshot.forEach((doc) => {
			blogs.push({ id: doc.id, ...doc.data() });
		});
		return res.status(200).json({
			success: true,
			data: blogs,
			message: "All blogs",
		});
	} catch (error) {
		return res.status(500).json({
			error: error,
			success: false,
			message: "Error in getting all blogs",
		});
	}
});

exports.getBlog = functions.https.onRequest(async (req, res) => {
	try {
		const { id } = req.query;
		if (!id) {
			return res.status(400).json({
				success: false,
				message: "Blog id is required",
			});
		}
		const blogDoc = await admin.firestore().collection("blogs").doc(id).get();

		if (!blogDoc.exists) {
			return res.status(404).json({
				success: false,
				message: "Blog not found",
			});
		}

		const blogData = { id: blogDoc.id, ...blogDoc.data() };
		return res.status(200).json({
			success: true,
			data: blogData,
			message: "Your requested blog",
		});
	} catch (error) {
		return res.status(500).json({
			error: error,
			success: false,
			message: "Error in getting blog",
		});
	}
});

exports.deleteBlog = functions.https.onRequest(async (req, res) => {
	try {
		const { id } = req.query;
		if (!id) {
			return res.status(400).json({
				success: false,
				message: "Blog id is required",
			});
		}

		const blogDoc = await admin.firestore().collection("blogs").doc(id).get();

		if (!blogDoc.exists) {
			return res.status(404).json({
				success: false,
				message: "Blog not found",
			});
		}

		await admin.firestore().collection("blogs").doc(id).delete();

		return res.status(200).json({
			success: true,
			message: "Blog deleted successfully",
		});
	} catch (error) {
		return res.status(500).json({
			error: error,
			success: false,
			message: "Error in deleting blog",
		});
	}
});
