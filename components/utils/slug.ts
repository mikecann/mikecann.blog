export const generateSlug = (str: string) => {
  str = str?.replace(/^\s+|\s+$/g, "");
  str = str?.toLowerCase();
  const from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
  const to = "aaaaaeeeeiiiioooouuuunc------";

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    ?.replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return str;
};

export const slugFromChildren = (children: any) => {
  const heading = (Array.isArray(children) ? children : [children])
    .flatMap((element) =>
      typeof element === "string"
        ? element
        : element?.type !== undefined && typeof element.props.children === "string"
          ? element.props.children
          : [],
    )
    .join("");

  return generateSlug(heading);
};
