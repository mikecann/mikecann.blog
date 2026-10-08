export type AssetSyncPlan = {
  /** Files to upload. */
  upload: string[];
  /** Files whose content differs from the copy in R2 but that this run may not replace. */
  skippedChanged: string[];
};

/**
 * Decides which local media files to upload. Files missing from the bucket are always uploaded and
 * files whose MD5 matches the remote ETag never are. A file whose content differs from the remote
 * copy is only uploaded with `overwrite`, which only production deploys set: production pages link
 * to the same keys, so a preview build of a branch must never replace them.
 *
 * `localMd5` is only called for files that are already in the bucket.
 */
export const planAssetSync = ({
  localFiles,
  remoteETags,
  localMd5,
  overwrite,
}: {
  localFiles: string[];
  remoteETags: Map<string, string>;
  localMd5: (relPath: string) => string;
  overwrite: boolean;
}): AssetSyncPlan => {
  const upload: string[] = [];
  const skippedChanged: string[] = [];
  for (const relPath of localFiles) {
    const remoteETag = remoteETags.get(relPath);
    if (remoteETag === undefined) upload.push(relPath);
    else if (remoteETag != localMd5(relPath)) {
      if (overwrite) upload.push(relPath);
      else skippedChanged.push(relPath);
    }
  }
  return { upload, skippedChanged };
};
