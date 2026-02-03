# Algorithm Interview Comprehensive Guide

This document provides detailed explanations of common algorithm interview patterns, including recognition signals, core principles, template code, and detailed solutions to typical problems.

**Priority Labels**: G=Google, M=Meta, A=Amazon, with priority levels P0 (must-know) / P1 (high-frequency) / P2 (good-to-know)

---

## 0. Universal Interview Opening Template

Communication strategy is key to interview success. Following this process demonstrates your professionalism and systematic thinking.

### Standard Process

1. **Clarify**: Confirm input/output format, data size range (n), duplicates allowed?, can modify original array?, what to return if not found?
2. **Brute Force**: Start with the simplest solution to show you understand the problem
3. **Identify Bottleneck**: Analyze time/space complexity of brute force, find optimization opportunities
4. **Choose Pattern**: Select appropriate algorithm pattern based on problem characteristics
5. **Write Pseudocode**: Write pseudocode first, confirm approach with interviewer
6. **Code + Edge Cases + Complexity**: Implement code, handle edge cases, analyze complexity

### Common Follow-up Questions

- How to handle empty/NULL input?
- Is in-place modification allowed?
- What are the complexity requirements?
- What to return if not found?

---

## 1. Greedy Algorithm

### 1.1 Core Concept

Greedy algorithms make the locally optimal choice at each step, hoping these local optima lead to a global optimum. The key is proving the correctness of the greedy choice.

**Conditions for Greedy to Work**:
- **Greedy Choice Property**: A global optimum can be constructed from local optimal choices
- **Optimal Substructure**: The optimal solution contains optimal solutions to subproblems

### 1.2 Assignment Problems

**Recognition Signals**:
- Find maximum/minimum count
- "One per person" matching problems
- Limited resources need allocation
- Local decisions don't need backtracking

**Core Strategy**: Sort + Use minimum resource to satisfy minimum need

**Why it works?** Using the smallest resource for the smallest need preserves larger resources for larger future needs.

**Template Code**:

```python
def assign_resources(needs, resources):
    needs.sort()
    resources.sort()
    i, j, count = 0, 0, 0
    while i < len(needs) and j < len(resources):
        if resources[j] >= needs[i]:
            count += 1
            i += 1
        j += 1
    return count
```

#### Problem 1: LeetCode 455 - Assign Cookies [P0(M/A)]

**Problem**: Given children with greed factors g[i] and cookies with sizes s[j]. If s[j] >= g[i], the child is satisfied. Find the maximum number of satisfied children.

**Analysis**:
1. Why greedy? Each cookie can only satisfy one child; we need to maximize satisfied children.
2. Greedy strategy: Give the smallest cookie that can satisfy the child with smallest greed.
3. Correctness proof: If optimal solution doesn't use smallest cookie for smallest greed, we can swap without worsening.

**Implementation**:

```python
def findContentChildren(g, s):
    g.sort()  # Sort children by greed
    s.sort()  # Sort cookies by size
    child, cookie = 0, 0
    
    while child < len(g) and cookie < len(s):
        if s[cookie] >= g[child]:
            # Current cookie satisfies current child
            child += 1
        # Try next cookie regardless
        cookie += 1
    
    return child

# Complexity:
# Time: O(n log n + m log m) for sorting
# Space: O(1) or O(log n) depending on sort implementation
```

#### Problem 2: LeetCode 135 - Candy [P1(A)]

**Problem**: n children in a line, each with a rating. Give candies such that: each child gets at least 1; children with higher ratings get more than their lower-rated neighbors. Find minimum candies needed.

**Analysis**:

Key insight: A child's candy count is affected by both neighbors, but considering both simultaneously is complex.

Greedy strategy: Split into two subproblems - traverse left-to-right and right-to-left, then take the maximum.

**Implementation**:

```python
def candy(ratings):
    n = len(ratings)
    candies = [1] * n  # Everyone gets at least 1
    
    # Left to right: if right rating > left rating, right gets more
    for i in range(1, n):
        if ratings[i] > ratings[i-1]:
            candies[i] = candies[i-1] + 1
    
    # Right to left: if left rating > right rating, left gets at least more
    for i in range(n-2, -1, -1):
        if ratings[i] > ratings[i+1]:
            candies[i] = max(candies[i], candies[i+1] + 1)
    
    return sum(candies)

# Complexity: O(n) time, O(n) space
```

### 1.3 Interval Problems

**Recognition Signals**:
- Interval overlap problems
- Remove minimum / schedule maximum intervals
- Meeting room scheduling

**Core Strategy**: Sort by end time

**Why sort by end?** Earlier end times leave more room for subsequent intervals.

**Template Code**:

```python
def interval_schedule(intervals):
    # Sort by end time
    intervals.sort(key=lambda x: x[1])
    
    count = 0
    end = float('-inf')
    
    for start, finish in intervals:
        if start >= end:  # No overlap
            count += 1
            end = finish
    
    return count
```

#### Problem 3: LeetCode 435 - Non-overlapping Intervals [P0(A/M)]

**Problem**: Given interval collection, find minimum number of intervals to remove so remaining intervals don't overlap.

**Approach**: Transform: remove minimum = keep maximum non-overlapping. Sort by end time, then greedily select.

**Implementation**:

```python
def eraseOverlapIntervals(intervals):
    if not intervals:
        return 0
    
    # Sort by end time
    intervals.sort(key=lambda x: x[1])
    
    keep = 1  # Keep at least the first one
    end = intervals[0][1]
    
    for i in range(1, len(intervals)):
        if intervals[i][0] >= end:  # No overlap
            keep += 1
            end = intervals[i][1]
    
    return len(intervals) - keep

# Complexity: O(n log n)
```

#### Problem 4: LeetCode 253 - Meeting Rooms II [P1(A)]

**Problem**: Given meeting time intervals, find minimum number of meeting rooms required.

**Approaches**:
- Method 1: Sweep line - separate start and end times, sort independently
- Method 2: Min heap - maintain end times of ongoing meetings

**Implementation (Sweep Line)**:

```python
def minMeetingRooms(intervals):
    # Separate start and end times
    starts = sorted([i[0] for i in intervals])
    ends = sorted([i[1] for i in intervals])
    
    rooms = 0
    end_ptr = 0
    
    for start in starts:
        if start < ends[end_ptr]:
            # Need a new room
            rooms += 1
        else:
            # Can reuse a room
            end_ptr += 1
    
    return rooms

# Time O(n log n), Space O(n)
```

---

## 2. Two Pointers

### 2.1 Core Concept

Two pointers leverage array ordering or specific structures, using pointer movement to reduce time complexity.

**Three Main Types**:
- **Opposite Pointers**: Move from both ends toward center
- **Same Direction Pointers (Sliding Window)**: Move in same direction, maintain window
- **Fast-Slow Pointers**: Move at different speeds, used for linked lists

### 2.2 Opposite Pointers

**Recognition Signals**:
- Sorted array
- Find pair summing to target
- Need deduplication

**Core Principle**: In sorted array, if sum < target, increase left pointer (increase sum); if sum > target, decrease right pointer (decrease sum).

**Template Code**:

```python
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    
    while left < right:
        curr_sum = nums[left] + nums[right]
        if curr_sum == target:
            return [left, right]
        elif curr_sum < target:
            left += 1  # Need larger sum
        else:
            right -= 1  # Need smaller sum
    
    return []
```

#### Problem 5: LeetCode 15 - 3Sum [P0(M)]

**Problem**: Find all unique triplets in array that sum to zero.

**Approach**: Fix first number, use two pointers for remaining two-sum. Key is deduplication.

**Implementation**:

```python
def threeSum(nums):
    nums.sort()
    result = []
    n = len(nums)
    
    for i in range(n - 2):
        # Pruning: if smallest is > 0, no solution possible
        if nums[i] > 0:
            break
        # Dedup: skip duplicate first numbers
        if i > 0 and nums[i] == nums[i-1]:
            continue
        
        left, right = i + 1, n - 1
        target = -nums[i]
        
        while left < right:
            curr_sum = nums[left] + nums[right]
            if curr_sum == target:
                result.append([nums[i], nums[left], nums[right]])
                # Dedup: skip duplicate second numbers
                while left < right and nums[left] == nums[left+1]:
                    left += 1
                # Dedup: skip duplicate third numbers
                while left < right and nums[right] == nums[right-1]:
                    right -= 1
                left += 1
                right -= 1
            elif curr_sum < target:
                left += 1
            else:
                right -= 1
    
    return result

# Complexity: O(n^2)
```

### 2.3 Sliding Window

**Recognition Signals**:
- Shortest/longest substring
- Satisfy some counting condition
- Contiguous subarray
- O(n) complexity hint

**Core Principle**: Maintain a window [left, right]. Right expands the window, left shrinks it, maintaining some property within the window.

**Note**: Window monotonicity is key. If negative numbers exist, many scenarios fail.

**Template Code (Minimum Window)**:

```python
def min_window(s, t):
    from collections import Counter
    need = Counter(t)
    missing = len(t)
    
    left = 0
    best_start, best_len = 0, float('inf')
    
    for right in range(len(s)):
        # Expand: add s[right]
        if need[s[right]] > 0:
            missing -= 1
        need[s[right]] -= 1
        
        # Shrink: when condition is met
        while missing == 0:
            # Update answer
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_start = left
            
            # Remove s[left]
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    
    return "" if best_len == float('inf') else s[best_start:best_start+best_len]
```

#### Problem 6: LeetCode 76 - Minimum Window Substring [P0(M)]

**Problem**: Given strings s and t, find minimum window in s containing all characters of t.

**Detailed Analysis**:
1. Use hash map to count character requirements in t
2. `missing` tracks how many characters still needed
3. Right pointer expands window; for each valid character added, decrement missing
4. When missing==0, window contains all needed characters; try shrinking left
5. Shrink until window no longer satisfies condition

**Complexity**: O(|s| + |t|) time, O(|charset|) space

#### Problem 7: LeetCode 3 - Longest Substring Without Repeating Characters [P0(M)]

**Problem**: Find longest substring without repeating characters.

**Implementation**:

```python
def lengthOfLongestSubstring(s):
    char_index = {}  # Character's last occurrence position
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        if s[right] in char_index and char_index[s[right]] >= left:
            # Found duplicate, move left past the duplicate
            left = char_index[s[right]] + 1
        
        char_index[s[right]] = right
        max_len = max(max_len, right - left + 1)
    
    return max_len

# Complexity: O(n) time, O(min(n, charset_size)) space
```

### 2.4 Fast-Slow Pointers

**Recognition Signals**:
- Linked list cycle detection
- Find middle of linked list
- Find kth node from end

**Floyd's Cycle Detection Principle**:

Fast pointer moves 2 steps, slow pointer moves 1 step. If there's a cycle, they will meet.

**Finding Cycle Entry**: After meeting, one pointer starts from head, another from meeting point, both move 1 step at a time. They meet at cycle entry.

**Mathematical Proof**:
- Let distance from head to cycle entry = a, entry to meeting point = b, meeting point back to entry = c
- At meeting: slow traveled a+b, fast traveled a+b+b+c = a+2b+c
- Fast is twice slow: 2(a+b) = a+2b+c, so **a = c**

**Template Code**:

```python
def detectCycle(head):
    slow = fast = head
    
    # Find meeting point
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            break
    else:
        return None  # No cycle
    
    # Find cycle entry
    fast = head
    while fast != slow:
        fast = fast.next
        slow = slow.next
    
    return fast
```

#### Problem 8: LeetCode 876 - Middle of the Linked List [P0(A)]

**Problem**: Find middle node of linked list. If two middle nodes, return the second.

**Implementation**:

```python
def middleNode(head):
    slow = fast = head
    
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    
    return slow  # When fast reaches end, slow is at middle

# Why it works?
# Fast travels twice the distance of slow
# When fast finishes, slow is halfway
```

---

## 3. Binary Search

### 3.1 Core Concept

Binary search eliminates half the search space each time, reducing O(n) linear search to O(log n).

**Essence of Binary Search**: Find the boundary satisfying a condition on a monotonic search space.

**Overflow Prevention**:
```python
mid = left + (right - left) // 2  # Not (left + right) // 2
```
Reason: left + right may overflow integer range.

### 3.2 Standard Binary Search (Closed Interval)

**Template Code**:

```python
def binary_search(nums, target):
    left, right = 0, len(nums) - 1  # [left, right]
    
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Not found
```

### 3.3 Boundary Binary Search (lower_bound / upper_bound)

- **lower_bound**: First position >= target
- **upper_bound**: First position > target

**Template Code (Half-Open Interval)**:

```python
def lower_bound(nums, target):
    left, right = 0, len(nums)  # [left, right)
    
    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] >= target:
            right = mid  # mid might be answer, keep it
        else:
            left = mid + 1
    
    return left

def upper_bound(nums, target):
    left, right = 0, len(nums)
    
    while left < right:
        mid = left + (right - left) // 2
        if nums[mid] > target:
            right = mid
        else:
            left = mid + 1
    
    return left
```

#### Problem 9: LeetCode 34 - Find First and Last Position [P0(M/A)]

**Problem**: Find starting and ending position of target in sorted array.

**Implementation**:

```python
def searchRange(nums, target):
    def lower_bound(target):
        left, right = 0, len(nums)
        while left < right:
            mid = left + (right - left) // 2
            if nums[mid] >= target:
                right = mid
            else:
                left = mid + 1
        return left
    
    first = lower_bound(target)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]
    
    # Last position = first position > target - 1
    last = lower_bound(target + 1) - 1
    return [first, last]
```

### 3.4 Binary Search on Answer

**Recognition Signals**:
- Find minimum of maximum / maximum of minimum
- Exists check(mid) function with monotonicity
- Direct solving is hard, but verifying if an answer works is easy

**Core Idea**: Binary search on the answer space, not on the data.

**Template Code**:

```python
def search_on_answer(low, high, check):
    left, right = low, high
    
    while left < right:
        mid = left + (right - left) // 2
        if check(mid):  # mid is feasible
            right = mid  # Try smaller answer
        else:
            left = mid + 1
    
    return left
```

#### Problem 10: LeetCode 875 - Koko Eating Bananas [P1(G)]

**Problem**: n piles of bananas with piles[i] bananas each. Guard leaves for h hours. Koko eats at speed k bananas/hour, finishing one pile before starting next. Find minimum k.

**Analysis**:
1. Answer range: 1 to max(piles)
2. Check function: Can Koko finish in h hours at speed k?
3. Monotonicity: Larger k means less time needed

**Implementation**:

```python
def minEatingSpeed(piles, h):
    def can_finish(k):
        hours = 0
        for p in piles:
            hours += (p + k - 1) // k  # Ceiling division
        return hours <= h
    
    left, right = 1, max(piles)
    
    while left < right:
        mid = left + (right - left) // 2
        if can_finish(mid):
            right = mid  # mid works, try smaller
        else:
            left = mid + 1  # mid doesn't work, need larger
    
    return left

# Complexity: O(n log max(piles))
```

### 3.5 Rotated Array Binary Search

**Recognition Signals**:
- Originally sorted array was rotated
- "Half sorted" characteristic

**Core Principle**: After rotation, array is split into two sorted parts. Key is determining which half mid is in, and which half target is in.

#### Problem 11: LeetCode 33 - Search in Rotated Sorted Array [P1(G)]

**Implementation**:

```python
def search(nums, target):
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if nums[mid] == target:
            return mid
        
        # Determine which half is sorted
        if nums[left] <= nums[mid]:  # Left half is sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:  # Right half is sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    
    return -1

# With duplicates (LeetCode 81), handle nums[left]==nums[mid]
# Can't determine which side is sorted, so left++ to skip
```

---

## 4. Sorting Related

### 4.1 Custom Sorting

**Recognition Signals**:
- Need comparison rules
- Interval/event processing
- Deduplication

#### Problem 12: LeetCode 56 - Merge Intervals [P0(A/M)]

**Problem**: Merge all overlapping intervals.

**Implementation**:

```python
def merge(intervals):
    if not intervals:
        return []
    
    # Sort by start position
    intervals.sort(key=lambda x: x[0])
    
    merged = [intervals[0]]
    
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:  # Overlap
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    
    return merged

# Complexity: O(n log n)
```

### 4.2 Quickselect (Kth Largest / Top K)

**Core Concept**: Use quicksort's partition idea, only process the half containing target. Average O(n).

#### Problem 13: LeetCode 215 - Kth Largest Element [P0(M/A)]

**Implementation**:

```python
def findKthLargest(nums, k):
    # kth largest = (n-k)th smallest (0-indexed)
    target = len(nums) - k
    
    def partition(left, right):
        pivot = nums[right]
        i = left
        for j in range(left, right):
            if nums[j] < pivot:
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
        nums[i], nums[right] = nums[right], nums[i]
        return i
    
    left, right = 0, len(nums) - 1
    while left <= right:
        pivot_idx = partition(left, right)
        if pivot_idx == target:
            return nums[pivot_idx]
        elif pivot_idx < target:
            left = pivot_idx + 1
        else:
            right = pivot_idx - 1
    
    return -1

# Average O(n), Worst O(n^2)
# Randomizing pivot avoids worst case
```

### 4.3 Bucket Sort / Frequency Bucket

#### Problem 14: LeetCode 347 - Top K Frequent Elements [P0(M/A)]

**Implementation**:

```python
def topKFrequent(nums, k):
    from collections import Counter
    
    count = Counter(nums)
    
    # Buckets: buckets[i] stores elements appearing i times
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, freq in count.items():
        buckets[freq].append(num)
    
    # Collect from high frequency to low
    result = []
    for freq in range(len(buckets) - 1, 0, -1):
        result.extend(buckets[freq])
        if len(result) >= k:
            return result[:k]
    
    return result

# Complexity: O(n)
```

---

## 5. Prefix Sum

### 5.1 Core Concept

Prefix sum is a preprocessing technique for O(1) range sum queries.

```
prefix[i] = nums[0] + nums[1] + ... + nums[i-1]
Range sum: sum(l, r) = prefix[r+1] - prefix[l]
```

#### Problem 15: LeetCode 560 - Subarray Sum Equals K [P0(M/A)]

**Problem**: Find count of contiguous subarrays summing to k.

**Approach**: If prefix[j] - prefix[i] = k, then subarray [i,j) sums to k. Use hash map to count prefix sum occurrences.

**Implementation**:

```python
def subarraySum(nums, k):
    prefix_count = {0: 1}  # Prefix sum 0 occurs once
    curr_sum = 0
    count = 0
    
    for num in nums:
        curr_sum += num
        # Find how many prefix sums equal curr_sum - k
        count += prefix_count.get(curr_sum - k, 0)
        prefix_count[curr_sum] = prefix_count.get(curr_sum, 0) + 1
    
    return count

# Complexity: O(n) time, O(n) space
```

#### Problem 16: LeetCode 525 - Contiguous Array [P1(A)]

**Problem**: Find longest subarray with equal number of 0s and 1s.

**Approach**: Convert 0 to -1, problem becomes finding longest subarray with sum 0.

**Implementation**:

```python
def findMaxLength(nums):
    # 0 becomes -1, find longest subarray with sum 0
    first_occurrence = {0: -1}  # First occurrence of prefix sum
    curr_sum = 0
    max_len = 0
    
    for i, num in enumerate(nums):
        curr_sum += 1 if num == 1 else -1
        
        if curr_sum in first_occurrence:
            max_len = max(max_len, i - first_occurrence[curr_sum])
        else:
            first_occurrence[curr_sum] = i
    
    return max_len
```

---

## 6. Stack and Queue

### 6.1 Parentheses Matching

#### Problem 17: LeetCode 20 - Valid Parentheses [P0(M/A)]

**Implementation**:

```python
def isValid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        else:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
    
    return len(stack) == 0
```

### 6.2 Monotonic Stack

**Recognition Signals**:
- Next greater/smaller element
- Histogram area
- Temperature-related problems

**Core Principle**: Maintain a monotonically increasing/decreasing stack. When new element breaks monotonicity, stack top finds its answer.

#### Problem 18: LeetCode 739 - Daily Temperatures [P0(M)]

**Problem**: Given temperature array, for each day find how many days until warmer temperature.

**Implementation**:

```python
def dailyTemperatures(temperatures):
    n = len(temperatures)
    result = [0] * n
    stack = []  # Store indices, corresponding temperatures are monotonically decreasing
    
    for i in range(n):
        # Current temp > stack top, stack top found its answer
        while stack and temperatures[i] > temperatures[stack[-1]]:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    
    return result

# Complexity: O(n), each element pushed and popped at most once
```

#### Problem 19: LeetCode 84 - Largest Rectangle in Histogram [P0(M/A)]

**Problem**: Find largest rectangle area in histogram.

**Approach**: For each bar, find how far it can extend left and right (first shorter bar on each side).

**Implementation**:

```python
def largestRectangleArea(heights):
    stack = []  # Monotonically increasing stack
    max_area = 0
    heights = [0] + heights + [0]  # Add sentinels
    
    for i, h in enumerate(heights):
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            width = i - stack[-1] - 1  # Left boundary is stack[-1], right is i
            max_area = max(max_area, height * width)
        stack.append(i)
    
    return max_area

# Sentinel purposes:
# Leading 0: ensures first element can be pushed
# Trailing 0: ensures all elements are popped and calculated
```

---

## 7. Depth-First Search (DFS)

### 7.1 Grid DFS

**Recognition Signals**:
- Grid/matrix
- Connected components
- Island problems

#### Problem 20: LeetCode 200 - Number of Islands [P0(M/A)]

**Implementation**:

```python
def numIslands(grid):
    if not grid:
        return 0
    
    rows, cols = len(grid), len(grid[0])
    count = 0
    
    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        if grid[r][c] != '1':
            return
        
        grid[r][c] = '0'  # Mark as visited
        dfs(r+1, c)
        dfs(r-1, c)
        dfs(r, c+1)
        dfs(r, c-1)
    
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    
    return count
```

### 7.2 Graph DFS (Cycle Detection)

**Three-Color Marking**:
- White (0): Unvisited
- Gray (1): Being visited (on current DFS path)
- Black (2): Completed

Encountering a gray node means there's a cycle.

#### Problem 21: LeetCode 207 - Course Schedule [P0(G)]

**Implementation**:

```python
def canFinish(numCourses, prerequisites):
    graph = [[] for _ in range(numCourses)]
    for course, prereq in prerequisites:
        graph[prereq].append(course)
    
    # 0=unvisited, 1=visiting, 2=completed
    color = [0] * numCourses
    
    def has_cycle(node):
        color[node] = 1  # Mark as visiting
        
        for neighbor in graph[node]:
            if color[neighbor] == 1:  # Found gray, cycle exists
                return True
            if color[neighbor] == 0 and has_cycle(neighbor):
                return True
        
        color[node] = 2  # Mark as completed
        return False
    
    for i in range(numCourses):
        if color[i] == 0 and has_cycle(i):
            return False
    
    return True
```

### 7.3 Memoized Search

**Core Concept**: DFS + Memoization = Top-down DP. Use memo to cache computed states, avoiding recomputation.

#### Problem 22: LeetCode 329 - Longest Increasing Path in a Matrix [P0(G)]

**Implementation**:

```python
def longestIncreasingPath(matrix):
    if not matrix:
        return 0
    
    rows, cols = len(matrix), len(matrix[0])
    memo = {}
    
    def dfs(r, c):
        if (r, c) in memo:
            return memo[(r, c)]
        
        max_len = 1
        for dr, dc in [(0,1), (0,-1), (1,0), (-1,0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if matrix[nr][nc] > matrix[r][c]:
                    max_len = max(max_len, 1 + dfs(nr, nc))
        
        memo[(r, c)] = max_len
        return max_len
    
    return max(dfs(r, c) for r in range(rows) for c in range(cols))

# Complexity: O(mn), each cell computed at most once
```

---

## 8. Breadth-First Search (BFS)

### 8.1 Core Concept

BFS is used for shortest path in unweighted graphs. It expands level by level; first arrival is guaranteed to be shortest path.

**Template Code**:

```python
from collections import deque

def bfs(start, target):
    queue = deque([start])
    visited = {start}
    steps = 0
    
    while queue:
        size = len(queue)
        for _ in range(size):
            node = queue.popleft()
            if node == target:
                return steps
            
            for neighbor in get_neighbors(node):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        
        steps += 1
    
    return -1  # Cannot reach
```

#### Problem 23: LeetCode 127 - Word Ladder [P0(G)]

**Problem**: Transform beginWord to endWord, changing one letter at a time, with intermediate words in wordList. Find shortest transformation sequence length.

**Implementation**:

```python
def ladderLength(beginWord, endWord, wordList):
    from collections import deque
    
    word_set = set(wordList)
    if endWord not in word_set:
        return 0
    
    queue = deque([(beginWord, 1)])
    visited = {beginWord}
    
    while queue:
        word, length = queue.popleft()
        
        for i in range(len(word)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                new_word = word[:i] + c + word[i+1:]
                
                if new_word == endWord:
                    return length + 1
                
                if new_word in word_set and new_word not in visited:
                    visited.add(new_word)
                    queue.append((new_word, length + 1))
    
    return 0

# Optimization: Bidirectional BFS significantly reduces search space
```

### 8.2 Multi-Source BFS

**Core Concept**: Start BFS from multiple sources simultaneously, find distance from each point to nearest source.

#### Problem 24: LeetCode 994 - Rotting Oranges [P0(G/A)]

**Implementation**:

```python
def orangesRotting(grid):
    from collections import deque
    
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    
    # Initialize: enqueue all rotten oranges
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    
    if fresh == 0:
        return 0
    
    minutes = 0
    directions = [(0,1), (0,-1), (1,0), (-1,0)]
    
    while queue:
        minutes += 1
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
    
    return minutes - 1 if fresh == 0 else -1
```

---

## 9. Dijkstra (Positive Weight Shortest Path)

### 9.1 Core Concept

Dijkstra's algorithm finds single-source shortest paths in weighted graphs, **requiring all weights to be non-negative**.

Core idea: Greedily select the unconfirmed node with smallest current distance, use it to update neighbors.

**Template Code**:

```python
import heapq

def dijkstra(graph, start, n):
    dist = [float('inf')] * n
    dist[start] = 0
    pq = [(0, start)]  # (distance, node)
    
    while pq:
        d, u = heapq.heappop(pq)
        
        if d > dist[u]:  # Already have shorter path, skip
            continue
        
        for v, w in graph[u]:  # (neighbor, edge weight)
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    
    return dist
```

#### Problem 25: LeetCode 743 - Network Delay Time [P0(G)]

**Implementation**:

```python
def networkDelayTime(times, n, k):
    import heapq
    
    graph = [[] for _ in range(n + 1)]
    for u, v, w in times:
        graph[u].append((v, w))
    
    dist = [float('inf')] * (n + 1)
    dist[k] = 0
    pq = [(0, k)]
    
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    
    max_dist = max(dist[1:])  # Nodes numbered from 1
    return max_dist if max_dist < float('inf') else -1
```

---

## 10. Dynamic Programming (DP)

### 10.1 Core DP Elements

Be able to clearly articulate these five points in interviews:

1. **State Definition**: What does dp[i] or dp[i][j] represent?
2. **State Transition**: How is dp[i] derived from previous states?
3. **Initialization**: Boundary conditions
4. **Traversal Order**: Ensure dependent states are computed when computing dp[i]
5. **Space Optimization**: Can we use rolling arrays?

### 10.2 1D Linear DP

#### Problem 26: LeetCode 70 - Climbing Stairs [P0(A)]

**Implementation**:

```python
def climbStairs(n):
    if n <= 2:
        return n
    
    # dp[i] = number of ways to reach step i
    # dp[i] = dp[i-1] + dp[i-2]
    
    prev2, prev1 = 1, 2
    for i in range(3, n + 1):
        curr = prev1 + prev2
        prev2, prev1 = prev1, curr
    
    return prev1

# Rolling array optimization: O(1) space
```

#### Problem 27: LeetCode 198 - House Robber [P0(A)]

**Implementation**:

```python
def rob(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    
    # dp[i] = max amount from first i houses
    # Choice: rob house i -> dp[i] = dp[i-2] + nums[i]
    #         skip house i -> dp[i] = dp[i-1]
    
    prev2, prev1 = 0, nums[0]
    for i in range(1, len(nums)):
        curr = max(prev1, prev2 + nums[i])
        prev2, prev1 = prev1, curr
    
    return prev1
```

### 10.3 2D String DP

#### Problem 28: LeetCode 72 - Edit Distance [P0(G)]

**Problem**: Find minimum operations (insert, delete, replace) to convert word1 to word2.

**State Definition**: dp[i][j] = minimum operations to convert word1[:i] to word2[:j]

**State Transition**:
- If word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1]
- Otherwise: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  - dp[i-1][j] + 1: delete word1[i-1]
  - dp[i][j-1] + 1: insert word2[j-1]
  - dp[i-1][j-1] + 1: replace

**Implementation**:

```python
def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    
    # dp[i][j] = word1[:i] -> word2[:j] minimum operations
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Initialize
    for i in range(m + 1):
        dp[i][0] = i  # Delete all characters
    for j in range(n + 1):
        dp[0][j] = j  # Insert all characters
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j],    # Delete
                    dp[i][j-1],    # Insert
                    dp[i-1][j-1]   # Replace
                )
    
    return dp[m][n]

# Complexity: O(mn) time, O(mn) space
# Can optimize to O(n) space
```

### 10.4 Partition DP

#### Problem 29: LeetCode 139 - Word Break [P0(G/M)]

**Implementation**:

```python
def wordBreak(s, wordDict):
    word_set = set(wordDict)
    n = len(s)
    
    # dp[i] = can s[:i] be segmented?
    dp = [False] * (n + 1)
    dp[0] = True  # Empty string can be segmented
    
    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    
    return dp[n]

# Optimization: limit j range to max word length
def wordBreak_optimized(s, wordDict):
    word_set = set(wordDict)
    max_len = max(len(w) for w in wordDict)
    n = len(s)
    
    dp = [False] * (n + 1)
    dp[0] = True
    
    for i in range(1, n + 1):
        for j in range(max(0, i - max_len), i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break
    
    return dp[n]
```

### 10.5 Subsequence DP (LIS)

#### Problem 30: LeetCode 300 - Longest Increasing Subsequence [P0(M/A)]

**O(n²) Solution**:

```python
def lengthOfLIS(nums):
    n = len(nums)
    # dp[i] = LIS length ending at nums[i]
    dp = [1] * n
    
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    
    return max(dp)
```

**O(n log n) Optimization (Binary Search)**:

```python
def lengthOfLIS_optimized(nums):
    # tails[i] = smallest ending element for LIS of length i+1
    tails = []
    
    for num in nums:
        # Binary search for first position >= num
        left, right = 0, len(tails)
        while left < right:
            mid = (left + right) // 2
            if tails[mid] < num:
                left = mid + 1
            else:
                right = mid
        
        if left == len(tails):
            tails.append(num)
        else:
            tails[left] = num
    
    return len(tails)
```

### 10.6 Knapsack DP

#### Problem 31: LeetCode 416 - Partition Equal Subset Sum [P0(G)]

**Problem**: Determine if array can be partitioned into two subsets with equal sums.

**Approach**: Equivalent to finding a subset with sum = total/2. This is 0-1 knapsack.

**Implementation**:

```python
def canPartition(nums):
    total = sum(nums)
    if total % 2 == 1:
        return False
    
    target = total // 2
    
    # dp[j] = can we form sum j?
    dp = [False] * (target + 1)
    dp[0] = True
    
    for num in nums:
        # Traverse from large to small to avoid reuse
        for j in range(target, num - 1, -1):
            dp[j] = dp[j] or dp[j - num]
    
    return dp[target]
```

#### Problem 32: LeetCode 322 - Coin Change [P1(A)]

**Complete Knapsack Problem**:

```python
def coinChange(coins, amount):
    # dp[i] = minimum coins to make amount i
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] != float('inf'):
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1
```

### 10.7 Stock DP (State Machine)

#### Problem 33: LeetCode 121 - Best Time to Buy and Sell Stock [P0(A)]

**Implementation**:

```python
def maxProfit(prices):
    # hold = max profit when holding stock
    # cash = max profit when not holding stock
    hold = float('-inf')
    cash = 0
    
    for price in prices:
        hold = max(hold, -price)       # Buy
        cash = max(cash, hold + price)  # Sell
    
    return cash
```

**General State Machine Template (k transactions)**:

```python
def maxProfit_k(prices, k):
    n = len(prices)
    if n == 0:
        return 0
    
    # dp[i][j][0/1] = day i, completed j transactions, not holding/holding
    dp = [[[0] * 2 for _ in range(k + 1)] for _ in range(n)]
    
    for j in range(k + 1):
        dp[0][j][1] = float('-inf')
    dp[0][0][1] = -prices[0]
    
    for i in range(1, n):
        for j in range(k + 1):
            dp[i][j][0] = max(dp[i-1][j][0], dp[i-1][j][1] + prices[i])
            if j > 0:
                dp[i][j][1] = max(dp[i-1][j][1], dp[i-1][j-1][0] - prices[i])
            else:
                dp[i][j][1] = dp[i-1][j][1]
    
    return max(dp[n-1][j][0] for j in range(k + 1))
```

---

## 11. Divide and Conquer

### 11.1 Core Concept

Break problem into independent subproblems, solve them, then combine results.

Three steps: **Divide → Conquer → Combine**

#### Problem 34: LeetCode 241 - Different Ways to Add Parentheses [P0(G)]

**Implementation**:

```python
def diffWaysToCompute(expression):
    memo = {}
    
    def compute(expr):
        if expr in memo:
            return memo[expr]
        
        # If pure number, return directly
        if expr.isdigit():
            return [int(expr)]
        
        results = []
        for i, ch in enumerate(expr):
            if ch in '+-*':
                # Split at operator
                left = compute(expr[:i])
                right = compute(expr[i+1:])
                
                # Combine all possible results
                for l in left:
                    for r in right:
                        if ch == '+':
                            results.append(l + r)
                        elif ch == '-':
                            results.append(l - r)
                        else:
                            results.append(l * r)
        
        memo[expr] = results
        return results
    
    return compute(expression)
```

#### Problem 35: LeetCode 23 - Merge k Sorted Lists [P1(A)]

**Divide and Conquer Solution**:

```python
def mergeKLists(lists):
    if not lists:
        return None
    
    def merge_two(l1, l2):
        dummy = ListNode(0)
        curr = dummy
        while l1 and l2:
            if l1.val < l2.val:
                curr.next = l1
                l1 = l1.next
            else:
                curr.next = l2
                l2 = l2.next
            curr = curr.next
        curr.next = l1 or l2
        return dummy.next
    
    def merge_range(left, right):
        if left == right:
            return lists[left]
        mid = (left + right) // 2
        l = merge_range(left, mid)
        r = merge_range(mid + 1, right)
        return merge_two(l, r)
    
    return merge_range(0, len(lists) - 1)

# Complexity: O(N log k), N = total nodes, k = number of lists
```

---

## 12. Trie (Prefix Tree)

### 12.1 Core Concept

Trie is a tree structure for efficiently storing and searching string collections.

**Characteristics**: Shares prefixes, search time complexity O(m), where m is string length.

#### Problem 36: LeetCode 208 - Implement Trie [P0(M/A)]

**Implementation**:

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True
    
    def search(self, word):
        node = self._find(word)
        return node is not None and node.is_word
    
    def startsWith(self, prefix):
        return self._find(prefix) is not None
    
    def _find(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node
```

#### Problem 37: LeetCode 212 - Word Search II [P1(G)]

**Trie + DFS with Pruning**:

```python
def findWords(board, words):
    # Build Trie
    root = {}
    for word in words:
        node = root
        for ch in word:
            node = node.setdefault(ch, {})
        node['#'] = word  # Store complete word
    
    rows, cols = len(board), len(board[0])
    result = []
    
    def dfs(r, c, node):
        ch = board[r][c]
        if ch not in node:
            return
        
        next_node = node[ch]
        if '#' in next_node:
            result.append(next_node['#'])
            del next_node['#']  # Avoid duplicates
        
        board[r][c] = '*'  # Mark visited
        for dr, dc in [(0,1), (0,-1), (1,0), (-1,0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '*':
                dfs(nr, nc, next_node)
        board[r][c] = ch  # Restore
        
        # Pruning: if node is empty, delete it
        if not next_node:
            del node[ch]
    
    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)
    
    return result
```

---

## 13. Topological Sort

### 13.1 Core Concept

Topological sort is used for DAGs (Directed Acyclic Graphs) to determine an ordering that satisfies dependencies.

**Kahn's Algorithm**: Maintain in-degrees, repeatedly take nodes with in-degree 0.

#### Problem 38: LeetCode 210 - Course Schedule II [P0(G)]

**Implementation**:

```python
def findOrder(numCourses, prerequisites):
    from collections import deque
    
    graph = [[] for _ in range(numCourses)]
    indegree = [0] * numCourses
    
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        indegree[course] += 1
    
    # Enqueue all nodes with in-degree 0
    queue = deque([i for i in range(numCourses) if indegree[i] == 0])
    order = []
    
    while queue:
        node = queue.popleft()
        order.append(node)
        
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)
    
    return order if len(order) == numCourses else []
```

---

## 14. Union-Find (Disjoint Set)

### 14.1 Core Concept

Union-Find handles merging and querying of disjoint sets.

**Two Optimizations**: Path compression (during find) + Union by rank (during union)

**Template Code**:

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.count = n  # Number of connected components
    
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]
    
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        
        # Union by rank
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        
        self.count -= 1
        return True
    
    def connected(self, x, y):
        return self.find(x) == self.find(y)
```

#### Problem 39: LeetCode 547 - Number of Provinces [P0(A/M)]

**Implementation**:

```python
def findCircleNum(isConnected):
    n = len(isConnected)
    uf = UnionFind(n)
    
    for i in range(n):
        for j in range(i + 1, n):
            if isConnected[i][j]:
                uf.union(i, j)
    
    return uf.count
```

#### Problem 40: LeetCode 684 - Redundant Connection [P0(G)]

**Implementation**:

```python
def findRedundantConnection(edges):
    n = len(edges)
    uf = UnionFind(n + 1)  # Nodes start from 1
    
    for u, v in edges:
        if not uf.union(u, v):
            return [u, v]  # This edge forms a cycle
    
    return []
```

---

## 15. LRU Cache

### 15.1 Core Concept

LRU (Least Recently Used) cache requires O(1) get and put operations.

**Implementation**: Hash map (O(1) lookup) + Doubly linked list (O(1) node movement)

#### Problem 41: LeetCode 146 - LRU Cache [P0(A)]

**Implementation**:

```python
class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}
        # Sentinel nodes for doubly linked list
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head
    
    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev
    
    def _add_to_head(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node
    
    def get(self, key):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_head(node)
        return node.val
    
    def put(self, key, value):
        if key in self.cache:
            node = self.cache[key]
            node.val = value
            self._remove(node)
            self._add_to_head(node)
        else:
            if len(self.cache) >= self.capacity:
                # Remove least recently used (tail.prev)
                lru = self.tail.prev
                self._remove(lru)
                del self.cache[lru.key]
            
            node = Node(key, value)
            self.cache[key] = node
            self._add_to_head(node)
```

---

## 16. Bit Manipulation

### 16.1 Common Tricks

- `x & (x-1)`: Clear lowest set bit
- `x & (-x)`: Isolate lowest set bit
- `a ^ b ^ b = a`: XOR self-inverse property

#### Problem 42: LeetCode 136 - Single Number [P0(M/A)]

**Implementation**:

```python
def singleNumber(nums):
    result = 0
    for num in nums:
        result ^= num
    return result

# Principle: a ^ a = 0, a ^ 0 = a
# All paired numbers XOR to 0, leaving the single one
```

#### Problem 43: LeetCode 338 - Counting Bits [P1(G)]

**Implementation**:

```python
def countBits(n):
    result = [0] * (n + 1)
    for i in range(1, n + 1):
        # i & (i-1) clears lowest set bit
        # So result[i] = result[i & (i-1)] + 1
        result[i] = result[i & (i-1)] + 1
    return result
```

---

## Summary: Company-Specific Practice Priorities

### Google (Emphasis on Derivation and Generalization)

**P0**: Binary search on answer, DFS+memo, 2D string DP, Topological sort, Dijkstra, Multi-source BFS, Divide and conquer

**P1**: Trie+DFS, Interval DP, LIS binary optimization, Complex graph modeling

### Meta (Emphasis on Pattern Proficiency)

**P0**: Sliding window, Two pointers, Prefix sum+hash, Monotonic stack, Backtracking dedup, Tree traversal/BFS

**P1**: TopK (heap/bucket/quickselect), KMP/matching, Graph BFS template

### Amazon (Emphasis on Engineering and Robustness)

**P0**: Linked list essentials (dummy/fast-slow/reverse), BFS level-order/shortest path, LRU, Interval greedy, Binary search boundaries

**P1**: TopK/heap, Union-Find connectivity, Simple DP

---

> **Remember**: Interview success depends not only on solving problems, but also on clearly expressing your thought process, analyzing complexity, and handling edge cases.
