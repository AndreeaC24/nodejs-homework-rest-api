const express = require("express");
const router = express.Router();
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatus,
} = require("../../models/contacts");

router.get("/", async (req, res, next) => {
  try {
    const result = await listContacts();
    res.status(200).json({
      status: "success",
      code: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);
    if (contact) {
      res.status(200).json({
        status: "success",
        code: 200,
        data: contact,
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "Not found",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.name || !body.email || !body.phone || !body.favorite) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Missing required field",
      });
    }
    const newContact = await addContact(body);

    res.status(201).json({
      id: newContact._id,
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      favorite: newContact.favorite,
      code: 201,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await removeContact(contactId);

    if (contact) {
      res.status(200).json({
        status: "success",
        code: 200,
        message: "Contact deleted",
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "Not found",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const body = req.body;

    const uContact = await updateContact(contactId, body);

    if (uContact) {
      res.status(200).json({
        status: "success",
        code: 200,
        data: uContact,
        message: "Contact updated",
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "Not found",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const body = req.body;

    if (!body || typeof body.favorite !== "boolean") {
      return res.status(400).json({
        message: "Favorite field must be a boolean",
        status: 400,
      });
    } else {
      const updatedContact = await updateStatus(contactId, body.favorite);
      res.status(200).json(updatedContact);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
