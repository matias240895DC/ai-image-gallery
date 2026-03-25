export const tableConfig = (page, limit) => {
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sort: { createdAt: -1 },
    populate: { path: "user", select: "name surname" },
  };
  return options;
};
