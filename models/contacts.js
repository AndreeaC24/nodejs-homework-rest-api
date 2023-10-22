const Contact = require("./schemas");

const listContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getContactById = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const addContact = async (body) => {
  try {
    const newContact = await Contact.create(body);
    return newContact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const removeContact = async (contactId) => {
  try {
    const removedContact = await Contact.findByIdAndRemove(contactId);
    if (!removedContact) {
      throw new Error("Contact not found");
    }
    return removedContact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateContact = async (contactId, body) => {
  try {
    const existingContact = await Contact.findById(contactId);
    if (!existingContact) {
      throw new Error("Contact not found");
    }
    existingContact.set(body);
    const updatedContact = await existingContact.save();

    return updatedContact;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateStatus = async (contactId, favorite) => {
  try {
    const contact = await Contact.findById(contactId);
    if (!contact) { 
      throw new Error("Contact not found");
    }

    contact.favorite = favorite;
    await contact.save();  

    return contact;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatus,
};
