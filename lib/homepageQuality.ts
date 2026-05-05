import fs from "node:fs";
import path from "node:path";

type BuildManifest = {
  rootMainFiles?: string[];
};

type RoutesManifest = {
  staticRoutes?: Array<{
    page: string;
  }>;
};

export const HOMEPAGE_BUILD_BUDGETS = {
  maxCssBytes: 20_000,
  maxRootMainBytes: 450_000,
  maxServerPageBytes: 2_048,
} as const;

export type HomepageSourceAudit = {
  avoidsPointerTracking: boolean;
  hasAuthCallsToAction: boolean;
  hasReducedMotionFallback: boolean;
  isServerComponent: boolean;
};

export type HomepageBuildBudgetReport = {
  cssAssetCount: number;
  cssBytes: number;
  isStaticRoute: boolean;
  rootMainBytes: number;
  serverPageBytes: number;
};

function getRequiredFilePath(projectRoot: string, pathSegments: string[], label: string) {
  const filePath = path.join(projectRoot, ...pathSegments);

  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found at ${filePath}. Run \`npm run build\` first.`);
  }

  return filePath;
}

function readRequiredTextFile(
  projectRoot: string,
  pathSegments: string[],
  label: string,
) {
  return fs.readFileSync(
    getRequiredFilePath(projectRoot, pathSegments, label),
    "utf8",
  );
}

function readRequiredJsonFile<T>(
  projectRoot: string,
  pathSegments: string[],
  label: string,
) {
  return JSON.parse(readRequiredTextFile(projectRoot, pathSegments, label)) as T;
}

function getFileSize(projectRoot: string, pathSegments: string[], label: string) {
  return fs.statSync(getRequiredFilePath(projectRoot, pathSegments, label)).size;
}

export function getHomepageSourceAudit(projectRoot = process.cwd()): HomepageSourceAudit {
  const pageSource = readRequiredTextFile(projectRoot, ["app", "page.tsx"], "Homepage source");
  const globalStyles = readRequiredTextFile(
    projectRoot,
    ["app", "globals.css"],
    "Global styles",
  );

  return {
    avoidsPointerTracking: !/pointermove|mousemove|onMouseMove|onPointerMove|requestAnimationFrame/.test(
      pageSource,
    ),
    hasAuthCallsToAction:
      pageSource.includes('href="/signup"') &&
      pageSource.includes('href="/login"') &&
      pageSource.includes('href="/profile"'),
    hasReducedMotionFallback: globalStyles.includes(
      "@media (prefers-reduced-motion: reduce)",
    ),
    isServerComponent: !/^\s*["']use client["'];?/m.test(pageSource),
  };
}

export function getHomepageBuildBudgetReport(
  projectRoot = process.cwd(),
): HomepageBuildBudgetReport {
  const buildManifest = readRequiredJsonFile<BuildManifest>(
    projectRoot,
    [".next", "build-manifest.json"],
    "Build manifest",
  );
  const routesManifest = readRequiredJsonFile<RoutesManifest>(
    projectRoot,
    [".next", "routes-manifest.json"],
    "Routes manifest",
  );
  const chunksDirectory = getRequiredFilePath(
    projectRoot,
    [".next", "static", "chunks"],
    "Chunk directory",
  );
  const cssAssets = fs
    .readdirSync(chunksDirectory)
    .filter((fileName) => fileName.endsWith(".css"));

  if (cssAssets.length === 0) {
    throw new Error(
      `Homepage CSS assets not found in ${chunksDirectory}. Run \`npm run build\` first.`,
    );
  }

  return {
    cssAssetCount: cssAssets.length,
    cssBytes: cssAssets.reduce(
      (totalBytes, fileName) =>
        totalBytes +
        getFileSize(
          projectRoot,
          [".next", "static", "chunks", fileName],
          `CSS asset ${fileName}`,
        ),
      0,
    ),
    isStaticRoute: (routesManifest.staticRoutes ?? []).some(
      (route) => route.page === "/",
    ),
    rootMainBytes: (buildManifest.rootMainFiles ?? []).reduce((totalBytes, fileName) => {
      const fileSegments = [".next", ...fileName.split("/")];
      return totalBytes + getFileSize(projectRoot, fileSegments, `Root main file ${fileName}`);
    }, 0),
    serverPageBytes: getFileSize(
      projectRoot,
      [".next", "server", "app", "page.js"],
      "Homepage server bundle",
    ),
  };
}

export function getHomepageBudgetViolations(
  report: HomepageBuildBudgetReport,
  budgets = HOMEPAGE_BUILD_BUDGETS,
) {
  const violations: string[] = [];

  if (!report.isStaticRoute) {
    violations.push("Homepage must remain a static route.");
  }

  if (report.rootMainBytes > budgets.maxRootMainBytes) {
    violations.push(
      `Root main bundle budget exceeded: ${report.rootMainBytes} > ${budgets.maxRootMainBytes}.`,
    );
  }

  if (report.cssBytes > budgets.maxCssBytes) {
    violations.push(`CSS budget exceeded: ${report.cssBytes} > ${budgets.maxCssBytes}.`);
  }

  if (report.serverPageBytes > budgets.maxServerPageBytes) {
    violations.push(
      `Homepage server bundle budget exceeded: ${report.serverPageBytes} > ${budgets.maxServerPageBytes}.`,
    );
  }

  return violations;
}
